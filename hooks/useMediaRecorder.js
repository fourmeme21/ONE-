import { useRef, useState, useCallback } from "react";

export function useMediaRecorder({ onCaptureComplete, onStreamReady, facingMode = "environment" }) {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Önizlemeyi durdur (Temizlik için her yerde kullanılır)
  const stopPreview = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  // Kamera önizlemesini başlat (V3.1: facingMode duyarlı)
  const startPreview = useCallback(async () => {
    // Yeni bir stream başlatmadan önce eskisini durdur (Kamera geçişi için kritik)
    stopPreview();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true, // V3.1: Ambient Sound (Ortam Sesi)
      });
      streamRef.current = stream;
      if (onStreamReady) onStreamReady(stream);
    } catch (err) {
      console.error("Camera access error:", err);
    }
  }, [onStreamReady, facingMode, stopPreview]);

  const startCapture = useCallback(async () => {
    if (isRecording || !streamRef.current) return;

    // V3.1: Manipüle edilemez zaman (UTC)
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

    // Android Chrome video/mp4 MediaRecorder'ı desteklemez — webm kullan
    // Öncelik sırası: webm/vp9 → webm/vp8 → webm → mp4
    const mimeType = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ].find((t) => MediaRecorder.isTypeSupported(t)) || "video/webm";

    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType,
      videoBitsPerSecond: 2_500_000, // 2.5 Mbps — yeterli kalite
    });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      console.log(`[ONE] Kayıt tamamlandı — format: ${mimeType}, boyut: ${(blob.size / 1024).toFixed(1)} KB`);
      setIsRecording(false);
      setCountdown(null);
      if (onCaptureComplete) onCaptureComplete({ blob, location, timestamp });
    };

    // timeslice=250ms — her 250ms'de ondataavailable tetiklenir, veri kaybolmaz
    recorder.start(250);
    setIsRecording(true);

    // 3 Saniye Kuralı (Countdown)
    let count = 3;
    setCountdown(count);
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(null);
        recorder.stop(); // 3 saniye dolunca otomatik durdur
      }
    }, 1000);
  }, [isRecording, onCaptureComplete]);

  return { isRecording, countdown, startPreview, stopPreview, startCapture };
}
