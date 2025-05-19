import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY가 없습니다." }, { status: 500 });
  }

  const data = await req.formData();
  const file = data.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: '파일이 업로드되지 않았습니다.' }, { status: 400 });
  }  
  try {
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
