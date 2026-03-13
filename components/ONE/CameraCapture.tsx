'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tyvezabojerfaxyctohm.supabase.co',
  'sb_publishable_1JoS_on8letn0YwSIhZMKA_l1F_f-b2'
);

const CameraCapture = ({ city = 'Istanbul', countryCode = 'TR' }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  // Başlangıcı 'environment' (arka kamera) yapıyoruz
  const [mode, setMode] = useState<'user' | 'environment'>('environment'); 
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    try {
      const constraints = {
        video: { 
          facingMode: { exact: mode } // 'exact' kullanarak tarayıcıyı zorluyoruz
        }
      };
      
      // Eğer 'exact' hata verirse (bazı eski cihazlar), normal moda düşür
      const s = await navigator.mediaDevices.getUserMedia(constraints)
        .catch(() => navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } }));

      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Kamera hatası:", err);
    }
  };

  useEffect(() => {
    startCamera();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, [mode]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0, 400, 500);
    const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);

    try {
      setUploading(true);
      const res = await fetch(imageData);
      const blob = await res.blob();
      const fileName = `moment-${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from('moments')
        .upload(fileName, blob);

      if (error) throw error;
      setIsDone(true); // Yükleme bittiğinde başarı moduna geç
    } catch (err: any) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative w-full aspect-[4/5] bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${capturedImage ? 'hidden' : ''}`} />
      {capturedImage && <img src={capturedImage} className="w-full h-full object-cover" />}
      <canvas ref={canvasRef} width={400} height={500} className="hidden" />

      {/* Arka/Ön Geçiş Butonu */}
      {!capturedImage && (
        <button 
          onClick={() => setMode(m => m === 'user' ? 'environment' : 'user')}
          className="absolute top-4 right-4 z-20 p-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/20 active:scale-90 transition-transform"
        >
          🔄
        </button>
      )}

      {/* Deklanşör */}
      {!capturedImage && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <button onClick={handleCapture} className="w-20 h-20 bg-white rounded-full border-[6px] border-white/20 p-1">
             <div className="w-full h-full bg-white rounded-full border border-black/10" />
          </button>
        </div>
      )}

      {/* Yükleme Ekranı */}
      <AnimatePresence>
        {uploading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
            <p className="text-white font-jetbrains text-xs tracking-[0.3em]">PROCESSING...</p>
          </motion.div>
        )}

        {isDone && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="absolute inset-x-0 bottom-0 bg-[var(--accent-electric)] p-6 text-black z-[60]">
            <div className="flex justify-between items-center">
               <p className="font-bebas text-2xl tracking-wider">MOMENT SENT ⚡</p>
               <button onClick={() => { setCapturedImage(null); setIsDone(false); }} className="font-jetbrains text-[10px] font-bold border-b border-black">DISMISS</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CameraCapture;
