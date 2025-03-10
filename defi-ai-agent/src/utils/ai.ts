import OpenAI from 'openai';

const HYPERBOLIC_API_KEY = process.env.HYPERBOLIC_API_KEY;

export const aiClient = new OpenAI({
  apiKey: HYPERBOLIC_API_KEY,
  baseURL: 'https://api.hyperbolic.xyz/v1',
});

export async function queryLLM(prompt: string) {
  try {
    if (!HYPERBOLIC_API_KEY) {
      console.error('Error: OpenAI API key is missing.');
      throw new Error('OpenAI API key is missing.');
    }

    console.log(prompt)
    const response = await aiClient.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3-70B-Instruct',
      messages: [{ role: 'system', content: 'You are a DeFi assistant.' }, { role: 'user', content: prompt }],
    });

    return response.choices[0]?.message?.content?.trim() || 'No response';
  } catch (error) {
    console.error('LLM Query Error:', error);
    throw new Error('AI processing failed.');
  }
}
