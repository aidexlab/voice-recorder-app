import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("❌ OPENAI_API_KEY 없음");
    return NextResponse.json({ error: 'API 키 없음' }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '오디오 파일 없음' }, { status: 400 });
    }

    const result = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    });

    return NextResponse.json({ result });
  } catch (err: any) {
    console.error("❌ Whisper 오류:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
