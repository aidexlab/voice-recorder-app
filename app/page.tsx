"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";


const translations = {
  en: { label: "English", heading: "Voice/Text Input", selectLabel: "Select Language", inputModeLabel: "Choose input method", voice: "🎙 Record", text: "⌨️ Type", message: "Hello, record or type your question in your native language!", start: "🎙 Start Recording", stop: "🛑 Stop Recording", preview: "Preview Recording:", error: "Audio playback failed. Try another browser.", done: "Save", delete: "Delete" },
  ko: { label: "한국어", heading: "음성/텍스트 입력", selectLabel: "언어 선택", inputModeLabel: "입력 방식 선택", voice: "🎙 녹음", text: "⌨️ 입력", message: "안녕하세요, 음성 또는 텍스트로 질문을 입력하세요!", start: "🎙 녹음 시작", stop: "🛑 녹음 종료", preview: "녹음 미리 듣기:", error: "오디오를 재생할 수 없습니다. 다른 브라우저를 시도해 보세요.", done: "저장", delete: "삭제" },
  km: { label: "ភាសាខ្មែរ", heading: "ការបញ្ចូលសម្លេង/អត្ថបទ", selectLabel: "ជ្រើសរើសភាសា", inputModeLabel: "ជ្រើសរើសវិធីបញ្ចូល", voice: "🎙 កត់ត្រាសម្លេង", text: "⌨️ វាយបញ្ចូល", message: "សូមកត់ត្រាឬវាយបញ្ចូលសំណួររបស់អ្នកដោយប្រើភាសាជាតិរបស់អ្នក!", start: "🎙 ចាប់ផ្តើមកត់ត្រា", stop: "🛑 បញ្ឈប់ការកត់ត្រា", preview: "មើលការកត់ត្រា:", error: "មិនអាចចាក់សម្លេងបានទេ សូមសាកល្បងកម្មវិធីរុករកផ្សេងទៀត។", done: "រក្សាទុក", delete: "លុប" },
  th: { label: "ภาษาไทย", heading: "การป้อนเสียง/ข้อความ", selectLabel: "เลือกภาษา", inputModeLabel: "เลือกวิธีการป้อน", voice: "🎙 บันทึกเสียง", text: "⌨️ พิมพ์", message: "กรุณาบันทึกหรือพิมพ์คำถามของคุณเป็นภาษาแม่ของคุณ!", start: "🎙 เริ่มบันทึก", stop: "🛑 หยุดบันทึก", preview: "ดูตัวอย่างการบันทึก:", error: "ไม่สามารถเล่นเสียงได้ โปรดลองเบราว์เซอร์อื่น", done: "บันทึก", delete: "ลบ" },
  vi: { label: "Tiếng Việt", heading: "Nhập bằng giọng nói/văn bản", selectLabel: "Chọn ngôn ngữ", inputModeLabel: "Chọn phương thức nhập", voice: "🎙 Ghi âm", text: "⌨️ Nhập", message: "Hãy ghi âm hoặc nhập câu hỏi bằng ngôn ngữ mẹ đẻ của bạn!", start: "🎙 Bắt đầu ghi âm", stop: "🛑 Dừng ghi âm", preview: "Xem trước bản ghi:", error: "Không phát được âm thanh. Vui lòng thử trình duyệt khác.", done: "Lưu", delete: "Xóa" },
  id: { label: "Bahasa Indonesia", heading: "Input Suara/Teks", selectLabel: "Pilih Bahasa", inputModeLabel: "Pilih metode input", voice: "🎙 Rekam", text: "⌨️ Ketik", message: "Silakan rekam atau ketik pertanyaan Anda dalam bahasa Anda!", start: "🎙 Mulai Merekam", stop: "🛑 Hentikan Rekaman", preview: "Pratinjau Rekaman:", error: "Gagal memutar audio. Coba browser lain.", done: "Simpan", delete: "Hapus" },
  mm: { label: "မြန်မာ", heading: "အသံ/စာသား ဖြင့်ထည့်သွင်းခြင်း", selectLabel: "ဘာသာစကား ရွေးချယ်ရန်", inputModeLabel: "ထည့်သွင်းနည်း ရွေးချယ်ရန်", voice: "🎙 အသံဖမ်း", text: "⌨️ စာထည့်ရန်", message: "ကျေးဇူးပြုပြီး မိမိမိခင်ဘာသာဖြင့် မေးခွန်းအား အသံဖမ်း သို့မဟုတ် ရိုက်ထည့်ပါ။", start: "🎙 အသံဖမ်းမှု စတင်ရန်", stop: "🛑 အသံဖမ်းမှု ရပ်ရန်", preview: "အသံဖမ်းမှု ကြည့်ရှုရန်:", error: "အသံဖွင့်၍မရပါ။ အခြား browser အသုံးပြုပါ။", done: "သိမ်းဆည်းပါ", delete: "ဖျက်ပါ" }
};

export default function VoiceRecorderApp() {
  const [language, setLanguage] = useState("en");
  const [inputMode, setInputMode] = useState("voice");
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const t = translations[language] ?? translations["en"];

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    let recorder: MediaRecorder;
    const isSafari = typeof navigator.userAgentData !== "undefined"
      ? navigator.userAgentData.brands?.some((b) => b.brand === "Safari")
      : /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    // Choose mimeType explicitly
    const mimeType = isSafari ? "audio/mp4" : "audio/webm";
    try {
      recorder = new MediaRecorder(stream, { mimeType });
    } catch {
      recorder = new MediaRecorder(stream);
    }

    mediaRecorderRef.current = recorder;
    audioChunksRef.current.length = 0;

    recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    recorder.onstop async () => {
      console.log("Recording stopped. Checking chunks...");
      console.log("Chunks:", audioChunksRef.current);
      if (audioChunksRef.current.length === 0) {
        console.warn("No audio chunks captured. Possible microphone access issue.");
        alert(t.error);
        setIsRecording(false);
        return;
      }

      const typeInner = isSafari ? "audio/mp4" : "audio/webm";
      const blob = new Blob(audioChunksRef.current, { type: typeInner });

// 🔽 Supabase에 업로드 시작
      const file = new File([blob], `recording-${Date.now()}.webm`, {
      type: "audio/webm",
      });

      const { data, error } = await supabase.storage
      .from("recordings") // ← 버킷 이름으로 변경
      .upload(`recordings/${file.name}`, file);

      if (error) {
      console.error("Supabase upload error:", error.message);
      return; // alert 생략하고 로그만 남김
      }

      console.log("✅ 업로드 성공:", data);
      alert("Success!");

      

      
      console.log("Blob size:", blob.size);
      if (blob.size === 0) {
        console.warn("Blob is empty. Cannot create audio URL.");
        alert(t.error);
        setIsRecording(false);
        return;
      }

      const url = URL.createObjectURL(blob);
      if (audioURL) URL.revokeObjectURL(audioURL);
      console.log("Audio URL:", url);
      setAudioURL(url);
      setIsRecording(false);
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const handleSubmitText = () => {
    console.log("Text submitted:", textInput);
    setTextInput("");
    if (audioURL) URL.revokeObjectURL(audioURL);
    setAudioURL(null);
  };

  const handleSubmitAudio = () => {
    console.log("Audio submitted:", audioURL);
    if (audioURL) URL.revokeObjectURL(audioURL);
    setAudioURL(null);
    setTextInput("");
  };

  return (
    <Card className="w-full max-w-lg mx-auto mt-10 p-6">
      <h2 className="text-xl font-bold mb-4">{t.heading}</h2>

      <div className="mb-4">
        <p className="mb-2 font-medium">{t.selectLabel}</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(translations).map(([code, lang]) => (
            <Button
              key={code}
              variant={language === code ? "default" : "outline"}
              className={language === code
                ? "bg-blue-600 text-white active:bg-gray-200 hover:bg-blue-100"
                : "bg-gray-100 text-black active:bg-gray-200 hover:bg-blue-100"}
              onClick={() => setLanguage(code)}
            >
              {lang.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-2 font-medium">{t.inputModeLabel}</p>
        <div className="flex gap-2">
          <Button
            variant={inputMode === "voice" ? "default" : "outline"}
            className={inputMode === 'voice'
              ? "bg-blue-600 text-white active:bg-gray-200 hover:bg-blue-100"
              : "bg-gray-100 text-black active:bg-gray-200 hover:bg-blue-100"}
            onClick={() => setInputMode("voice")}
          >
            {t.voice}
          </Button>
          <Button
            variant={inputMode === "text" ? "default" : "outline"}
            className={inputMode === 'text'
              ? "bg-blue-600 text-white active:bg-gray-200 hover:bg-blue-100"
              : "bg-gray-100 text-black active:bg-gray-200 hover:bg-blue-100"}
            onClick={() => setInputMode("text")}
          >
            {t.text}
          </Button>
        </div>
      </div>

      <p className="mb-4 font-semibold">{t.message}</p>

      {inputMode === "voice" ? (
        <div>
          {!isRecording ? (
            <Button onClick={startRecording} className="bg-blue-600 text-white hover:bg-blue-700">{t.start}</Button>
          ) : (
            <Button onClick={stopRecording} className="bg-red-600 text-white hover:bg-red-700">{t.stop}</Button>
          )}
          {audioURL && (
            <CardContent className="mt-4">
              <p className="mb-2">{t.preview}</p>
              <audio controls src={audioURL} className="w-full" />
              <div className="mt-4 flex justify-end">
                <Button onClick={() => { if (audioURL) URL.revokeObjectURL(audioURL); setAudioURL(null); }} variant="outline" className="mr-2 text-red-600 border-red-600 flex items-center gap-1"><Trash2 size={16} /> {t.delete}</Button>
                <Button onClick={handleSubmitAudio} variant="outline" className="text-green-600 border-green-600 flex items-center gap-1"><CheckCircle size={16} /> {t.done}</Button>
              </div>
            </CardContent>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <textarea
            placeholder="Type your message here..."
            className="w-full border rounded px-4 py-2 h-32"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <Button onClick={() => { setTextInput(""); if (audioURL) URL.revokeObjectURL(audioURL); setAudioURL(null); }} variant="outline" className="mr-2 text-red-600 border-red-600 flex items-center gap-1"><Trash2 size={16} /> {t.delete}</Button>
            <Button onClick={handleSubmitText} variant="outline" className="text-green-600 border-green-600 flex items-center gap-1"><CheckCircle size={16} /> {t.done}</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
