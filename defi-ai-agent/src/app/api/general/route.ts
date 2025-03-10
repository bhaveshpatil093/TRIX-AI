/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/defi/query/route.ts
import { NextResponse } from 'next/server';
import { formatGeneralPrompt } from '@/utils/prompt';
import { queryLLM } from '@/utils/ai';
export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const formattedPrompt = formatGeneralPrompt(text);
    const response = await queryLLM(formattedPrompt);
    return NextResponse.json({ data: response });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}