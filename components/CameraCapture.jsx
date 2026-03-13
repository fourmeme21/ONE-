"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";

export default function CameraCapture({ onCaptureComplete }) {
  const videoRef = useRef(null);

  const handleCaptureComplete = useCallback(
    ({ blob, location, timestamp }) => {
      if (onCaptureComplete) onCaptureComplete({ blob, location, timestamp });
    },
    [onCaptureComplete]
  );

  const { isRecording, countdown, startCapture, streamRef } = useMediaRecorder({
    onCaptureComplete: handleCaptureComplete,
  });

  useEffect(() => {
    if (!videoRef.current) return;
    if (streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [streamRef.current]);

  return (
    <div className={`relative w-full overflow-hidden bg-black transition-all duration-500 ${isRecording ? 'fixed inset-0 z-[100] h-[100dvh]' : 'rounded-3xl aspect-[3/4] shadow-2xl border border-white/10'}`}>
      
      {/* Kamera Görüntüsü */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Arayüz Katmanı */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 bg-gradient-to-b from-black/40 via-transparent to-black/60">
        
        <div className="flex justify-center">
          <span className="text-[10px] tracking-[0.4em] text-[#00fff7] font-bold uppercase opacity-80">
            {isRecording ? "Kayıt Yapılıyor" : "Canlı Önizleme"}
          </span>
        </div>

        {/* Geri Sayım Rakamı */}
        <div className="flex items-center justify-center">
          {countdown !== null && (
            <span className="text-8xl font-black text-[#ff003c] animate-ping">{countdown}</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          {!isRecording && (
            <p className="text-[10px] text-white/50 tracking-widest uppercase text-center">
              Dokun ve 3 Saniye Yakala
            </p>
          )}
          
          <button
            onClick={(e) => { e.preventDefault(); startCapture(); }}
            disabled={isRecording}
            className={`rounded-full transition-all duration-300 active:scale-90 ${isRecording ? 'w-16 h-16 border-4 border-[#ff003c] bg-transparent' : 'w-20 h-20 border-2 border-[#00fff7] bg-[#00fff7]/10 shadow-[0_0_20px_#00fff744]'}`}
          >
            <div className={`mx-auto rounded-full transition-all ${isRecording ? 'w-6 h-6 bg-[#ff003c]' : 'w-14 h-14 bg-[#00fff7]'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
