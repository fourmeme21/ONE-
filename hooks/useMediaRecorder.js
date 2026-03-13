import { useRef, useState, useCallback } from "react";

export function useMediaRecorder({ onCaptureComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startCapture = useCallback(async () => {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: true,
      });
      streamRef.current = stream;
      chunksRef.current = [];

      // Konum ve zaman damgası
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

      // MIME type seçimi (iOS Safari webm desteklemez)
      const mimeType = MediaRecorder.isTypeSupported("video/mp4")
        ? "video/mp4"
        : "video/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setIsRecording(false);
        setCountdown(null);
        if (onCaptureComplete) onCaptureComplete({ blob, location, timestamp });
      };

      recorder.start();
      setIsRecording(true);

      // Geri sayım: 3 → 2 → 1
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
    } catch (err) {
      console.error("Medya erişim hatası:", err);
      setIsRecording(false);
    }
  }, [isRecording, onCaptureComplete]);

  const stopEarly = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return { isRecording, countdown, startCapture, stopEarly, streamRef };
}
