'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraCaptureProps {
  city?: string;
  countryCode?: string;
  onCapture?: (imageData: string) => void;
  isDisabled?: boolean;
  isCaptured?: boolean;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  city = 'Istanbul',
  countryCode = 'TR',
  onCapture,
  isDisabled = false,
  isCaptured = false,
}) => {
  const [countdown, setCountdown] = useState(3);
  const [showFlash, setShowFlash] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Kamerayı başlat
  useEffect(() => {
    if (isDisabled || isCaptured) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 1280 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } catch (err) {
        setCameraError('Kamera erişimi reddedildi');
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isDisabled, isCaptured]);

  // 3 saniyelik geri sayım
  useEffect(() => {
    if (!cameraActive || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cameraActive, countdown]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    setShowFlash(true);
    setCapturedImage(imageData);
    setTimeout(() => setShowFlash(false), 300);

    // Kamerayı kapat
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    onCapture?.(imageData);
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
      <div className="absolute inset-0 rounded-3xl border-2 border-[var(--border-subtle)] overflow-hidden bg-black">

        {/* Canlı kamera görüntüsü */}
        {!capturedImage && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Çekilen fotoğraf */}
        {capturedImage && (
          <img src={capturedImage} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
        )}

        {/* Kamera hatası */}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-jetbrains text-xs text-red-400 uppercase tracking-wider text-center px-4">{cameraError}</p>
          </div>
        )}

        {/* Konum */}
        <div className="absolute top-4 left-4 z-20">
          <div className="font-jetbrains text-xs tracking-widest text-[var(--accent-electric)] uppercase bg-black/50 px-2 py-1 rounded">
            📍 {city}, {countryCode}
          </div>
        </div>

        {/* Geri sayım */}
        {cameraActive && !capturedImage && (
          <motion.div className="absolute top-4 right-4 z-20" animate={{ scale: countdown === 0 ? [1, 1.2, 0.8, 1] : 1 }}>
            <div className={`px-3 py-1 rounded-full font-bebas text-sm font-bold ${countdown === 0 ? 'bg-green-500' : 'bg-red-500'} text-white`}>
              {countdown === 0 ? 'ÇEK!' : `${countdown}s`}
            </div>
          </motion.div>
        )}

        {/* Köşe braketleri */}
        {[
          { className: 'top-4 left-4', border: 'border-t-2 border-l-2' },
          { className: 'top-4 right-4', border: 'border-t-2 border-r-2' },
          { className: 'bottom-4 left-4', border: 'border-b-2 border-l-2' },
          { className: 'bottom-4 right-4', border: 'border-b-2 border-r-2' },
        ].map((bracket, i) => (
          <div key={i} className={`absolute w-8 h-8 ${bracket.className} z-10`}>
            <div className={`absolute inset-0 ${bracket.border} border-[var(--accent-electric)]`} />
          </div>
        ))}

        {/* Çekildi mesajı */}
        {(isCaptured || capturedImage) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
            <div className="text-center">
              <div className="text-5xl mb-2">✓</div>
              <p className="font-jetbrains text-xs text-[var(--accent-alive)] uppercase tracking-wider">Captured</p>
            </div>
          </motion.div>
        )}

        {isDisabled && !isCaptured && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
            <p className="font-jetbrains text-xs text-[var(--text-ghost)] uppercase tracking-wider">Already captured today</p>
          </div>
        )}
      </div>

      {/* Canvas (gizli) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Çekim butonu */}
      {!isDisabled && !capturedImage && !isCaptured && (
        <motion.button
          onClick={handleCapture}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full border-4 border-white bg-white/20 flex items-center justify-center z-30"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="w-10 h-10 rounded-full bg-white" />
        </motion.button>
      )}

      {/* Flash efekti */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            className="absolute inset-0 rounded-3xl bg-white z-40"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export { CameraCapture };
export default CameraCapture;
