import { useRef, useState, useCallback } from "react";

export function useMediaRecorder({ onCaptureComplete, onStreamReady }) {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Kamera önizlemesini başlat (component mount'ta çağrılır)
  const startPreview = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: true,
      });
      streamRef.current = stream;
      if (onStreamReady) onStreamReady(stream);
    } catch (err) {
      console.error("Kamera erişim hatası:", err);
    }
  }, [onStreamReady]);

  // Önizlemeyi durdur (component unmount'ta çağrılır)
  const stopPreview = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCapture = useCallback(async () => {
    if (isRecording || !streamRef.current) return;

    const timestamp = new Date().toUTCString();
    let location = null;
    try {
      location = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, long: pos.coords.longitude }),
          (err) => reject(err),
          { timeout: 3000 }
        );
      });
    } catch {
      location = null;
    }

    const mimeType = MediaRecorder.isTypeSupported("video/mp4")
      ? "video/mp4"
      : "video/webm";

    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setIsRecording(false);
      setCountdown(null);
      if (onCaptureComplete) onCaptureComplete({ blob, location, timestamp });
    };

    recorder.start();
    setIsRecording(true);

    let count = 3;
    setCountdown(count);
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(null);
        recorder.stop();
      }
    }, 1000);
  }, [isRecording, onCaptureComplete]);

  return { isRecording, countdown, startPreview, stopPreview, startCapture };
}
