"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";

const MAX_DURATION = 30;

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CameraCapture({ onCaptureComplete }) {
  const videoRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment");

  const handleStreamReady = useCallback((stream) => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, []);

  const {
    isRecording,
    countdown,
    recordingTime,
    canStop,
    startPreview,
    stopPreview,
    startCapture,
    stopRecording,
  } = useMediaRecorder({
    onCaptureComplete,
    onStreamReady: handleStreamReady,
    facingMode,
  });

  useEffect(() => {
    startPreview();
    return () => stopPreview();
  }, [facingMode, startPreview, stopPreview]);

  const toggleCamera = () => {
    if (isRecording) return;
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const progress = (recordingTime / MAX_DURATION) * 100;

  return (
    <div style={{ height: "100dvh" }} className="relative w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
        style={{ filter: "none", WebkitFilter: "none" }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Header */}
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

      {/* Countdown */}
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

      {/* REC + Süre Sayacı */}
      {isRecording && (
        <div
          className="absolute top-0 left-0 right-0 z-10 flex flex-col items-center gap-2"
          style={{ marginTop: "calc(env(safe-area-inset-top, 16px) + 44px)" }}
        >
          {/* REC badge */}
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full"
            style={{ background: "rgba(255,0,60,0.15)", border: "1px solid rgba(255,0,60,0.6)" }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "#ff003c", boxShadow: "0 0 8px #ff003c" }}
            />
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "#ff003c" }}>
              REC
            </span>
            {/* Canlı süre */}
            <span className="text-xs font-bold tabular-nums ml-1" style={{ color: "#ff003c" }}>
              {formatTime(recordingTime)} / {formatTime(MAX_DURATION)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "#ff003c", boxShadow: "0 0 6px #ff003c" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </div>
        </div>
      )}

      {/* Corner Frame */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {["top-4 left-4 border-t border-l", "top-4 right-4 border-t border-r", "bottom-4 left-4 border-b border-l", "bottom-4 right-4 border-b border-r"].map((pos, i) => (
          <div key={i} className={`absolute w-6 h-6 ${pos}`} style={{ borderColor: "#00fff7", opacity: 0.7 }} />
        ))}
      </div>

      {/* Camera Toggle */}
      <button
        onClick={toggleCamera}
        disabled={isRecording}
        className="absolute right-8 bottom-32 z-20 p-3 rounded-full border transition-all active:scale-90 disabled:opacity-30"
        style={{ borderColor: "#00fff7", background: "rgba(0,255,247,0.1)", boxShadow: "0 0 15px rgba(0,255,247,0.3)" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00fff7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </button>

      {/* Capture / Stop Butonu */}
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-col items-center z-10"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 24px) + 16px)" }}
      >
        {!isRecording && (
          <p className="mb-5 text-xs tracking-widest uppercase font-light" style={{ color: "rgba(0,255,247,0.6)" }}>
            Hold up to 30 seconds · Min 3s
          </p>
        )}

        {/* Min 3sn dolmadıysa uyarı */}
        {isRecording && !canStop && (
          <p className="mb-3 text-xs tracking-widest uppercase font-light" style={{ color: "rgba(255,0,60,0.7)" }}>
            Keep recording...
          </p>
        )}

        <button
          onClick={isRecording ? (canStop ? stopRecording : undefined) : startCapture}
          disabled={isRecording && !canStop}
          aria-label={isRecording ? "Stop" : "Start Capture"}
          className="relative flex items-center justify-center rounded-full transition-transform active:scale-95"
          style={{
            width: 84,
            height: 84,
            opacity: isRecording && !canStop ? 0.4 : 1,
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
              borderRadius: isRecording ? "8px" : "50%",
            }}
          />
        </button>
      </div>

      <style>{`
        @keyframes neonPop {
          0%   { transform: scale(1.4); opacity: 0.4; }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
