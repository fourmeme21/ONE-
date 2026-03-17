import { useRef, useState, useCallback } from "react";

export function useMediaRecorder({ onCaptureComplete, onStreamReady, facingMode = "environment" }) {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0); // 0-30 arası saniye
  const [canStop, setCanStop] = useState(false); // ilk 3sn false

  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const maxTimerRef = useRef(null);

  const stopPreview = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startPreview = useCallback(async () => {
    stopPreview();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true,
      });
      streamRef.current = stream;
      if (onStreamReady) onStreamReady(stream);
    } catch (err) {
      console.error("Camera access error:", err);
    }
  }, [onStreamReady, facingMode, stopPreview]);

  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current);
    clearTimeout(maxTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startCapture = useCallback(async () => {
    if (isRecording || !streamRef.current) return;

    const timestamp = new Date().toUTCString();
    let location = null;

    try {
      location = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => reject(err),
          { timeout: 8000, enableHighAccuracy: false, maximumAge: 60000 }
        );
      });
    } catch {
      location = null;
    }

    // iOS Safari webm desteklemiyor — mp4/h264 kullan
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const mimeType = isIOS
      ? (["video/mp4;codecs=avc1", "video/mp4"].find((t) => MediaRecorder.isTypeSupported(t)) || "video/mp4")
      : (["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((t) => MediaRecorder.isTypeSupported(t)) || "video/webm");

    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType,
      videoBitsPerSecond: 2_500_000,
    });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const duration = elapsed;
      console.log(`[ONE] Kayıt tamamlandı — format: ${mimeType}, boyut: ${(blob.size / 1024).toFixed(1)} KB, süre: ${duration}sn`);
      setIsRecording(false);
      setCountdown(null);
      setRecordingTime(0);
      setCanStop(false);
      if (onCaptureComplete) onCaptureComplete({ blob, location, timestamp, durationSec: duration });
    };

    recorder.start(250);
    setIsRecording(true);
    setRecordingTime(0);
    setCanStop(false);

    // 3-2-1 countdown
    let count = 3;
    setCountdown(count);
    const countInterval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countInterval);
        setCountdown(null);
        setCanStop(true); // min 3sn doldu, stop aktif
      }
    }, 1000);

    // Canlı süre sayacı (her saniye)
    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 1;
      setRecordingTime(elapsed);
    }, 1000);

    // Max 30sn otomatik dur
    maxTimerRef.current = setTimeout(() => {
      clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    }, 30000);

  }, [isRecording, onCaptureComplete]);

  return {
    isRecording,
    countdown,
    recordingTime,
    canStop,
    startPreview,
    stopPreview,
    startCapture,
    stopRecording,
  };
}
