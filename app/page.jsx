"use client";

import { useState, useEffect } from "react";
import CameraCapture from "@/components/CameraCapture";

export default function Home() {
  const [result, setResult] = useState(null);

  const handleCaptureComplete = ({ blob, location, timestamp }) => {
    // 1. Video URL'ini güvenli bir şekilde oluştur
    const videoURL = URL.createObjectURL(blob);
    
    // 2. State'i güncelle (Bu otomatik olarak önizleme ekranını açar)
    setResult({ videoURL, location, timestamp });
  };

  // Önizleme geldiğinde ekranın başına odaklan
  useEffect(() => {
    if (result) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [result]);

  // Önizleme Ekranı
  if (result) {
    return (
      <div className="fixed inset-0 w-full h-[100dvh] bg-black flex flex-col items-center justify-between z-[50]">
        <div className="w-full flex-1 flex flex-col items-center justify-center p-4 gap-6">
          <h2 className="text-[#00fff7] text-[10px] tracking-[0.4em] uppercase opacity-70">Önizleme</h2>
          
          <video
            src={result.videoURL}
            controls
            autoPlay
            playsInline
            className="w-full max-w-sm rounded-2xl border border-white/10 shadow-2xl shadow-[#00fff7]/10"
            style={{ maxHeight: "55dvh", objectFit: "cover" }}
          />

          <div className="text-center space-y-4">
            <div>
              <p className="text-[9px] tracking-widest uppercase text-[#00fff7] mb-1">Konum</p>
              <p className="text-white text-xs font-mono">
                {result.location
                  ? `${result.location.lat.toFixed(6)}, ${result.location.long.toFixed(6)}`
                  : "Konum saptanamadı"}
              </p>
            </div>
            <div>
              <p className="text-[9px] tracking-widest uppercase text-[#00fff7] mb-1">Zaman Damgası (UTC)</p>
              <p className="text-white text-xs font-mono">{result.timestamp}</p>
            </div>
          </div>
        </div>

        <div className="p-8 w-full max-w-sm">
          <button
            onClick={() => {
              URL.revokeObjectURL(result.videoURL); // Belleği temizle
              setResult(null); // Kameraya geri dön
            }}
            className="w-full py-4 rounded-xl text-sm tracking-[0.2em] uppercase font-bold transition-all active:scale-95 bg-black border border-[#00fff7] text-[#00fff7] shadow-[0_0_20px_rgba(0,255,247,0.2)]"
          >
            Yeni Çekim Yap
          </button>
        </div>
      </div>
    );
  }

  // Kamera Ekranı
  return <CameraCapture onCaptureComplete={handleCaptureComplete} />;
}
