/* eslint-disable @typescript-eslint/no-explicit-any */
import { queryLLM } from '@/utils/ai';
import { formatTradingPrompt } from '@/utils/prompt';
import { NextResponse } from 'next/server';

async function getTradingData() {
  try {
    const response = await fetch('https://api.llama.fi/overview/dexs');
    const dexData = await response.json();

    console.log({ dexData });

    if (!dexData.protocols || !Array.isArray(dexData.protocols)) {
      throw new Error('Unexpected API response structure');
    }

    const sonicDexs = dexData.protocols
      .filter((dex: any) =>
        dex.chains?.some((chain: string) => chain.toLowerCase() === "sonic")
      )
      .slice(0, 10) // Limit to top 10 entries to reduce size
      .map((dex: any) => ({
        name: dex.name,
        chains: dex.chains,
        total24h: formatNumber(dex.total24h),
        change_1d: dex.change_1d,
        change_7d: dex.change_7d,
        logo: dex.logo
      }));

    console.log(sonicDexs);
    return sonicDexs;
  } catch (error) {
    console.error('DefiLlama Trading API Error:', error);
    throw new Error('Failed to fetch trading data from DefiLlama');
  }
}

function formatNumber(num: number): string {
  if (!num) return "0";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toString();
}

export async function GET() {
  try {
    const tradingData = await getTradingData();
    const formattedData = JSON.stringify(tradingData, null, 2);
    console.log({ formattedData });

    const formattedPrompt = formatTradingPrompt(formattedData);
    const analysis = await queryLLM(formattedPrompt);
    
    return NextResponse.json({ data: analysis });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
