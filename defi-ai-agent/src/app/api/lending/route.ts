/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { queryLLM } from '@/utils/ai';
import { formatLendingPrompt } from '@/utils/prompt';

async function getLendingProtocols() {
  try {
    const response = await fetch('https://api.llama.fi/protocols');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const protocols = await response.json();

    // Filter for protocols on Arbitrum that are categorized as lending and have TVL data.
    const filteredProtocols = protocols.filter((protocol: any) => {
      const chainStr = protocol.chain?.toLowerCase() || "";
      const chainsArray = Array.isArray(protocol.chains)
        ? protocol.chains.map((chain: string) => chain.toLowerCase())
        : [];
      const isArbitrum =
        chainStr.includes("sonic") ||
        chainsArray.some((chain: string) => chain.includes("sonic"));

      const isLending = protocol.category?.toLowerCase().includes("lending");
      return isArbitrum && isLending && protocol.tvl;
    });

    return filteredProtocols;
  } catch (error) {
    console.error('DefiLlama Lending API Error:', error);
    throw new Error('Failed to fetch lending protocols from DefiLlama');
  }
}

export async function GET() {
  try {
    const lendingProtocols = await getLendingProtocols();

    // Optionally limit the number of protocols to avoid an oversized prompt.
    const limitedProtocols = lendingProtocols.slice(0, 5);
    const formattedData = JSON.stringify(limitedProtocols, null, 2);
    const formattedPrompt = formatLendingPrompt(formattedData);

    const analysis = await queryLLM(formattedPrompt);
    return NextResponse.json({ data: analysis });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
