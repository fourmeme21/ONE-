"use client";

import { useState } from "react";
import CameraCapture from "@/components/CameraCapture";

export default function Home() {
  const [result, setResult] = useState(null);

  const handleCaptureComplete = ({ blob, location, timestamp }) => {
    const videoURL = URL.createObjectURL(blob);
    setResult({ videoURL, location, timestamp });
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-4 flex flex-col items-center">
      {/* App Header */}
      <div className="w-full max-w-md pt-8 pb-12 flex justify-between items-center">
        <h1 className="text-2xl font-black tracking-tighter italic text-[#00fff7]">ONE</h1>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00fff7] to-[#ff003c]" />
      </div>

      <div className="w-full max-w-md space-y-8">
        {!result ? (
          /* KAMERA MODU */
          <div className="space-y-6">
            <CameraCapture onCaptureComplete={handleCaptureComplete} />
            <div className="px-2">
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2">Talimat</h2>
              <p className="text-xs text-white/60 leading-relaxed">
                Butona bastığında 3 saniyelik ham görüntü ve ortam sesi kaydedilir. Filtre yok, düzenleme yok. Sadece o an.
              </p>
            </div>
          </div>
        ) : (
          /* ÖNİZLEME MODU */
          <div className="animate-in fade-in zoom-in duration-500 space-y-6">
            <div className="rounded-3xl overflow-hidden border border-[#00fff7]/30 shadow-[0_0_40px_#00fff711] bg-black aspect-[3/4] relative">
              <video 
                src={result.videoURL} 
                controls 
                autoPlay 
                loop 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                 <p className="text-[9px] text-[#00fff7] font-mono tracking-tighter">
                   {result.location?.lat.toFixed(4)}, {result.location?.long.toFixed(4)}
                 </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setResult(null)}
                className="py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                İptal Et
              </button>
              <button 
                className="py-4 rounded-2xl bg-[#00fff7] text-black text-[10px] font-bold uppercase tracking-widest shadow-[0_0_20px_#00fff744]"
              >
                Paylaş
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
