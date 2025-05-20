// 1) 반드시 맨 위에 추가 — Edge가 아닌 Node.js로 실행됩니다.

export const runtime = 'nodejs';


import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("❌ OPENAI_API_KEY가 없습니다.");
    return NextResponse.json({ error: 'API 키 누락' }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey });

  // 2) formData에서 Blob으로 꺼냅니다.
  const formData = await req.formData();
  const blob = formData.get('file') as Blob | null;
  if (!blob) {
    return NextResponse.json({ error: '파일이 업로드되지 않았습니다.' }, { status: 400 });
  }

  try {
    // Blob을 File로 감싸도 되고, SDK가 Blob도 받을 수 있습니다.
    const fileForUpload = new File([blob], 'upload.webm', { type: blob.type });

    const transcription = await openai.audio.transcriptions.create({
      file: fileForUpload,
      model: 'whisper-1',
    });

    return NextResponse.json({ text: transcription.text });
  } catch (err: any) {
    console.error("❌ Whisper 호출 실패:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
