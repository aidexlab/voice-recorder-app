import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { message } = await req.json();

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo', // GPT 모델 선택
      messages: [{ role: 'user', content: message }],
    });

    return NextResponse.json({ reply: completion.choices[0].message.content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
