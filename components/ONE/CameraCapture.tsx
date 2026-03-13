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
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment'); // Varsayılan arka kamera
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: facingMode } 
      });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      console.error("Kamera açılmadı:", err);
    }
  };

  useEffect(() => {
    startCamera();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

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
      const fileName = `${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from('moments')
        .upload(fileName, blob);

      if (error) throw error;
      // Alert yerine aşağıda 'uploading' state'i ile kontrol edilen görsel mesaj gelecek
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative w-full aspect-[4/5] bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${capturedImage ? 'hidden' : ''}`} />
      
      {capturedImage && <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />}
      <canvas ref={canvasRef} width={400} height={500} className="hidden" />
      
      {/* Üst Bilgi Barı */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-jetbrains text-[var(--accent-electric)] border border-white/10 uppercase tracking-tighter">
          📍 {city}, {countryCode}
        </div>
      </div>

      {/* Kamera Değiştirme Butonu (Sadece çekimden önce) */}
      {!capturedImage && (
        <button 
          onClick={toggleCamera}
          className="absolute top-4 right-4 z-20 p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
        >
          <span className="text-lg">🔄</span>
        </button>
      )}
      
      {/* Alt Kontrol (Deklanşör) */}
      {!capturedImage && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleCapture} 
            className="w-20 h-20 bg-white rounded-full border-[6px] border-white/30 flex items-center justify-center shadow-inner"
          >
            <div className="w-14 h-14 bg-white rounded-full border-2 border-black/5" />
          </motion.button>
        </div>
      )}
      
      {/* Yükleme ve Başarı Mesajı (Artık alert yok) */}
      <AnimatePresence>
        {uploading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50"
          >
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-bebas text-2xl text-white tracking-widest uppercase">GÖNDERİLİYOR...</p>
          </motion.div>
        )}

        {!uploading && capturedImage && (
          <motion.div 
            initial={{ y: 50 }} animate={{ y: 0 }}
            className="absolute bottom-6 left-6 right-6 bg-green-500 text-black p-4 rounded-2xl flex items-center justify-between z-50 shadow-2xl"
          >
            <span className="font-bebas text-xl">ANI KAYDEDİLDİ! 🚀</span>
            <button onClick={() => setCapturedImage(null)} className="text-xs font-bold underline">YENİ ÇEK</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CameraCapture;
