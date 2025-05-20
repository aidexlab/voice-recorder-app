export const runtime = 'nodejs';


import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  // ✅ 여기에 추가: 실제 환경변수가 제대로 불러와지는지 확인
  console.log("OPENAI_API_KEY =", process.env.OPENAI_API_KEY);

  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("❌ OPENAI_API_KEY가 없습니다.");
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
  } catch (err: any) {
    console.error("❌ GPT 호출 실패:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
