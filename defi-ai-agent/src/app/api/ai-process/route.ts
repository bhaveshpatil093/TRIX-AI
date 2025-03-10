/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import OpenAI from 'openai';

// Initialize Viem client for blockchain interactions (if needed)
const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

// Get Hyperbolic API key from environment variables
const HYPERBOLIC_API_KEY = process.env.HYPERBOLIC_API_KEY;

const aiClient = new OpenAI({
  apiKey: HYPERBOLIC_API_KEY,
  baseURL: 'https://api.hyperbolic.xyz/v1',
});

async function queryLLM(prompt: string) {
  try {
    const response = await aiClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a DeFi AI assistant. You help users with cryptocurrency tasks and provide accurate information.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'meta-llama/Meta-Llama-3-70B-Instruct',
    });
    return (
      response.choices[0]?.message?.content?.trim() ||
      'Could not generate response. Please try again.'
    );
  } catch (error) {
    console.error('LLM Error:', error);
    throw new Error('Failed to process with LLM');
  }
}

function formatPrompt(
  text: string,
  type: 'swap' | 'lending' | 'trading' | 'general'
) {
  const baseContext = `You are a DeFi AI assistant.Your name is Trix. You help users with cryptocurrency tasks and provide accurate information.`;

  const prompts = {
    swap: `${baseContext} Analyze this swap request and extract the following information in JSON format:
Request: "${text}"
Return only a JSON object with:
{
  "fromToken": "token symbol",
  "toToken": "token symbol",
  "amount": "numeric amount",
  "chain": "chain name if specified"
}`,
    lending: `${baseContext} Analyze the following lending protocol data and provide the top 3 recommendations.
Data: ${text}
Consider TVL, APY, and security factors.
Format your response as:
1. [Protocol Name] - [APY]% APY
   - TVL: $[amount]
   - Risk Level: [Low/Medium/High]
   - Recommendation Summary: [brief summary]`,
    trading: `${baseContext} Analyze the following DEX trading data on Arbitrum and provide the best trading opportunities.
Data: ${text}
Consider liquidity, trading volume, fees, and potential slippage.
Format your response as:
1. [DEX Name] - [Opportunity Summary]
   - Liquidity: $[amount]
   - Volume: $[amount]
   - Risk Level: [Low/Medium/High]
   - Recommendation: [brief recommendation]`,
    general: `${baseContext} Provide a clear and concise response to this DeFi question:
Question: ${text}`,
  };

  return prompts[type] || prompts.general;
}

/**
 * Get lending protocols from DefiLlama's /protocols endpoint.
 * This function first filters for protocols relevant to Arbitrum—by checking the `chain` field
 * and the optional `chains` array—then further narrows the results by ensuring that the protocol's
 * category includes "lending" and that it has a valid TVL value.
 */
async function getLendingProtocols() {
  try {
    const response = await fetch('https://api.llama.fi/protocols');
    const protocols = await response.json();

    // First, filter for protocols that are relevant to Arbitrum.
    const arbitrumProtocols = protocols.filter((protocol: any) => {
      // Check if the main chain field includes "arbitrum"
      const chainString = protocol.chain?.toLowerCase() || "";
      // Also check if any of the chains in the chains array include "arbitrum"
      const chainsArray =
        Array.isArray(protocol.chains) &&
        protocol.chains.map((chain: string) => chain.toLowerCase());
      const isArbitrum =
        chainString.includes("arbitrum") ||
        (chainsArray && chainsArray.some((chain: string) => chain.includes("arbitrum")));
      return isArbitrum;
    });

    // Then, filter among Arbitrum protocols for those whose category includes "lending" and have a valid TVL.
    const lendingProtocols = arbitrumProtocols.filter((protocol: any) => {
      const categoryLower = protocol.category?.toLowerCase() || "";
      const isLending = categoryLower.includes("lending");
      return isLending && protocol.tvl;
    });

    return lendingProtocols;
  } catch (error) {
    console.error('DefiLlama Lending API Error:', error);
    throw new Error('Failed to fetch lending protocols from DefiLlama');
  }
}

/**
 * Get trading (DEX) data from DefiLlama's /overview/dexs endpoint.
 */
async function getTradingData() {
  try {
    const response = await fetch('https://api.llama.fi/overview/dexs');
    const dexData = await response.json();

    // Filter for DEXs operating on Arbitrum.
    const arbitrumDexs = dexData.filter((dex: any) =>
      dex.chain?.toLowerCase().includes("arbitrum")
    );
    return arbitrumDexs;
  } catch (error) {
    console.error('DefiLlama Trading API Error:', error);
    throw new Error('Failed to fetch trading data from DefiLlama');
  }
}

export async function POST(req: Request) {
  try {
    const { text, action } = await req.json();

    switch (action) {
      case 'swap': {
        const formattedPrompt = formatPrompt(text, 'swap');
        const swapInstructions = await queryLLM(formattedPrompt);
        try {
          const parsedInstructions = JSON.parse(swapInstructions);
          return NextResponse.json({
            type: 'swap',
            data: parsedInstructions,
          });
        } catch (e) {
          return NextResponse.json({
            type: 'swap',
            error: 'Failed to parse swap instructions',
            rawResponse: swapInstructions,
          });
        }
      }

      case 'lending': {
        // Fetch lending protocols using DefiLlama's /protocols endpoint
        const lendingProtocols = await getLendingProtocols();
        const formattedData = JSON.stringify(lendingProtocols, null, 2);
        const formattedPrompt = formatPrompt(formattedData, 'lending');
        const analysis = await queryLLM(formattedPrompt);
        return NextResponse.json({
          type: 'lending',
          data: analysis,
        });
      }

      case 'trading': {
        // Fetch DEX data from DefiLlama's trading endpoint
        const tradingData = await getTradingData();
        const formattedData = JSON.stringify(tradingData, null, 2);
        const formattedPrompt = formatPrompt(formattedData, 'trading');
        const analysis = await queryLLM(formattedPrompt);
        return NextResponse.json({
          type: 'trading',
          data: analysis,
        });
      }

      default: {
        const formattedPrompt = formatPrompt(text, 'general');
        const response = await queryLLM(formattedPrompt);
        return NextResponse.json({
          type: 'general',
          data: response,
        });
      }
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to process request',
        type: 'error',
      },
      { status: 500 }
    );
  }
}
