"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";

export default function CameraCapture({ onCaptureComplete }) {
  const videoRef = useRef(null);
  // V3.1: Kamera yönü state'i (user = ön, environment = arka)
  const [facingMode, setFacingMode] = useState("user");

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
      facingMode: facingMode, // Hook'a yönü gönderiyoruz
    });

  // Kamera yönü değişince veya ilk açılışta önizlemeyi başlat
  useEffect(() => {
    startPreview();
    return () => stopPreview();
  }, [facingMode, startPreview, stopPreview]);

  // Kamera değiştirme fonksiyonu
  const toggleCamera = () => {
    if (isRecording) return; // Kayıt sırasında değişimi engelle
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    <div
      style={{ height: "100dvh" }}
      className="relative w-full overflow-hidden bg-black"
    >
      {/* Raw Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover ${
          facingMode === "user" ? "scale-x-[-1]" : ""
        }`}
        style={{ filter: "none", WebkitFilter: "none" }}
      />

      {/* Ambient Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Header Info */}
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

      {/* Countdown Overlay (V3.1 Neon) */}
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

      {/* Recording Indicator (V3.1 Neon) */}
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

      {/* Corner Frame */}
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

      {/* Camera Flip Button (V3.1 Addition) */}
      <button
        onClick={toggleCamera}
        disabled={isRecording}
        className="absolute right-8 bottom-32 z-20 p-3 rounded-full border transition-all active:scale-90 disabled:opacity-30"
        style={{
          borderColor: "#00fff7",
          background: "rgba(0,255,247,0.1)",
          boxShadow: "0 0 15px rgba(0,255,247,0.3)"
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00fff7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 4v6h-6"></path>
          <path d="M1 20v-6h6"></path>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
      </button>

      {/* Bottom Control Section */}
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-col items-center z-10"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 24px) + 16px)" }}
      >
        {!isRecording && (
          <p className="mb-5 text-xs tracking-widest uppercase font-light" style={{ color: "rgba(0,255,247,0.6)" }}>
            Capture your 3-second reality
          </p>
        )}

        <button
          onClick={startCapture}
          disabled={isRecording}
          aria-label="Start Capture"
          className="relative flex items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-50"
          style={{
            width: 84,
            height: 84,
            background: isRecording ? "rgba(255,0,60,0.1)" : "rgba(0,255,247,0.05)",
            border: isRecording ? "2px solid #ff003c" : "2px solid #00fff7",
            boxShadow: isRecording
              ? "0 0 30px #ff003c, inset 0 0 20px rgba(255,0,60,0.2)"
              : "0 0 30px #00fff7, inset 0 0 20px rgba(0,255,247,0.1)",
          }}
        >
          <div
            className="rounded-full transition-all duration-300"
            style={{
              width: isRecording ? 40 : 56,
              height: isRecording ? 40 : 56,
              background: isRecording ? "#ff003c" : "#00fff7",
              boxShadow: isRecording ? "0 0 20px #ff003c" : "0 0 20px #00fff7",
              borderRadius: isRecording ? "8px" : "50%"
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
