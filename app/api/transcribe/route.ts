import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("❌ OPENAI_API_KEY 환경변수가 없습니다.");
    return NextResponse.json({ error: 'API 키 누락' }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '오디오 파일이 없습니다.' }, { status: 400 });
    }

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error("❌ Whisper API 호출 실패:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
