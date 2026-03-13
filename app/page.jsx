"use client";

import { useState } from "react";
import CameraCapture from "@/components/CameraCapture";

export default function Home() {
  const [result, setResult] = useState(null);

  const handleCaptureComplete = ({ blob, location, timestamp }) => {
    console.log("Çekim tamamlandı:", { blob, location, timestamp });

    // Önizleme için local URL oluştur
    const videoURL = URL.createObjectURL(blob);
    setResult({ videoURL, location, timestamp });

    // --- Supabase'e yüklemek istersen buraya ekle ---
    // const file = new File([blob], `one_${Date.now()}.mp4`, { type: blob.type });
    // const { data, error } = await supabase.storage
    //   .from("videos")
    //   .upload(`uploads/${file.name}`, file);
  };

  // Çekim tamamlandıysa önizleme göster
  if (result) {
    return (
      <div
        style={{ height: "100dvh" }}
        className="relative w-full overflow-hidden bg-black flex flex-col items-center justify-center gap-6"
      >
        <video
          src={result.videoURL}
          controls
          playsInline
          className="w-full max-w-sm rounded-xl"
          style={{ maxHeight: "60dvh", objectFit: "cover" }}
        />

        <div className="text-center px-6">
          <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#00fff7" }}>
            Konum
          </p>
          <p className="text-white text-sm mb-4">
            {result.location
              ? `${result.location.lat.toFixed(5)}, ${result.location.long.toFixed(5)}`
              : "Konum alınamadı"}
          </p>
          <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#00fff7" }}>
            Zaman
          </p>
          <p className="text-white text-sm">{result.timestamp}</p>
        </div>

        <button
          onClick={() => setResult(null)}
          className="px-8 py-3 rounded-full text-sm tracking-widest uppercase font-medium transition-transform active:scale-95"
          style={{
            background: "rgba(0,255,247,0.1)",
            border: "1px solid #00fff7",
            color: "#00fff7",
            boxShadow: "0 0 16px rgba(0,255,247,0.3)",
          }}
        >
          Yeni Çekim
        </button>
      </div>
    );
  }

  // Ana kamera ekranı
  return <CameraCapture onCaptureComplete={handleCaptureComplete} />;
}
