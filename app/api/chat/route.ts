import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("❌ OPENAI_API_KEY 환경변수가 없습니다.");
    return NextResponse.json({ error: 'API 키 누락' }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey });

  const { message } = await req.json();

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: message }],
    });

    return NextResponse.json({ reply: completion.choices[0].message.content });
  } catch (error: any) {
    console.error("❌ OpenAI 응답 실패:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
