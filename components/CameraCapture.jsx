"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";

export default function CameraCapture({ onCaptureComplete }) {
  const videoRef = useRef(null);

  // Stream hazır olunca doğrudan video elementine bağla
  const handleStreamReady = useCallback((stream) => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, []);

  const { isRecording, countdown, startPreview, stopPreview, startCapture } =
    useMediaRecorder({
      onCaptureComplete,
      onStreamReady: handleStreamReady,
    });

  // Açılınca önizleme başlat, kapanınca durdur
  useEffect(() => {
    startPreview();
    return () => stopPreview();
  }, []); // eslint-disable-line

  return (
    <div
      style={{ height: "100dvh" }}
      className="relative w-full overflow-hidden bg-black"
    >
      {/* Ham kamera görüntüsü — sıfır filtre */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "none", WebkitFilter: "none" }}
      />

      {/* Karanlık kenar gradyanı */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Üst başlık */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10"
        style={{ paddingTop: "env(safe-area-inset-top, 16px)", paddingBottom: "12px" }}
      >
        <span
          className="text-xs tracking-[0.3em] uppercase font-light"
          style={{ color: "#00fff7", textShadow: "0 0 10px #00fff7, 0 0 20px #00fff7" }}
        >
          ONE · RAW REALITY
        </span>
      </div>

      {/* Geri sayım overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <span
            key={countdown}
            className="text-[20vw] font-black tabular-nums select-none"
            style={{
              color: "#ff003c",
              textShadow: "0 0 20px #ff003c, 0 0 60px #ff003c, 0 0 120px #ff003c",
              animation: "neonPop 0.3s ease-out",
            }}
          >
            {countdown}
          </span>
        </div>
      )}

      {/* Kayıt göstergesi */}
      {isRecording && (
        <div
          className="absolute top-0 left-0 right-0 z-10"
          style={{ marginTop: "calc(env(safe-area-inset-top, 16px) + 44px)" }}
        >
          <div
            className="mx-auto flex items-center gap-2 px-3 py-1 rounded-full w-fit"
            style={{ background: "rgba(255,0,60,0.15)", border: "1px solid rgba(255,0,60,0.6)" }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "#ff003c", boxShadow: "0 0 8px #ff003c" }}
            />
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "#ff003c" }}>
              REC
            </span>
          </div>
        </div>
      )}

      {/* Köşe çerçevesi */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {[
          "top-4 left-4 border-t border-l",
          "top-4 right-4 border-t border-r",
          "bottom-4 left-4 border-b border-l",
          "bottom-4 right-4 border-b border-r",
        ].map((pos, i) => (
          <div key={i} className={`absolute w-6 h-6 ${pos}`} style={{ borderColor: "#00fff7", opacity: 0.7 }} />
        ))}
      </div>

      {/* Alt çekim butonu */}
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-col items-center z-10"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 24px) + 16px)" }}
      >
        {!isRecording && (
          <p className="mb-5 text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>
            3 saniyelik gerçekliğini yakala
          </p>
        )}

        <button
          onClick={startCapture}
          disabled={isRecording}
          aria-label="Çekim başlat"
          className="relative flex items-center justify-center rounded-full transition-transform active:scale-90 disabled:opacity-50"
          style={{
            width: 80,
            height: 80,
            background: isRecording ? "rgba(255,0,60,0.2)" : "rgba(0,255,247,0.1)",
            border: isRecording ? "2px solid #ff003c" : "2px solid #00fff7",
            boxShadow: isRecording
              ? "0 0 24px #ff003c, inset 0 0 16px rgba(255,0,60,0.2)"
              : "0 0 24px #00fff7, inset 0 0 16px rgba(0,255,247,0.15)",
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: 52,
              height: 52,
              background: isRecording ? "#ff003c" : "#00fff7",
              boxShadow: isRecording ? "0 0 20px #ff003c" : "0 0 20px #00fff7",
            }}
          />
        </button>
      </div>

      <style>{`
        @keyframes neonPop {
          0%   { transform: scale(1.4); opacity: 0.4; }
          100% { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
