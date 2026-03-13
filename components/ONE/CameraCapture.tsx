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
  const [mode, setMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    async function start() {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: mode, 
            width: { ideal: 1920 }, 
            height: { ideal: 1080 } 
          } 
        });
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (e) { console.error(e); }
    }
    start();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, [mode]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const img = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(img);
    setUploading(true);

    try {
      const res = await fetch(img);
      const blob = await res.blob();
      await supabase.storage.from('moments').upload(`${Date.now()}.jpg`, blob);
    } catch (e) { console.error(e); }
    setUploading(false);
  };

  return (
    <div 
      style={!capturedImage ? { 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: 9999,
        backgroundColor: 'black'
      } : { 
        position: 'relative', 
        width: '94%', // Kartı biraz daha genişlettik
        margin: '20px auto', 
        borderRadius: '32px', 
        overflow: 'hidden', 
        aspectRatio: '3/4' // Daha uzun bir kart görünümü
      }}
      className="transition-all duration-500 ease-in-out"
    >
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover shadow-2xl" 
        style={{ display: capturedImage ? 'none' : 'block' }} 
      />
      
      {capturedImage && <img src={capturedImage} className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500" />}
      
      <canvas ref={canvasRef} className="hidden" />

      {!capturedImage && (
        <>
          {/* Üst Bilgi Barı */}
          <div className="absolute top-14 left-6 z-20 bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-white text-[10px] font-mono tracking-widest uppercase">
            📍 {city}, {countryCode}
          </div>
          
          {/* Kamera Çevirme Butonu */}
          <button 
            onClick={() => setMode(m => m === 'user' ? 'environment' : 'user')} 
            className="absolute top-14 right-6 z-20 p-4 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 text-2xl active:scale-90 transition-transform"
          >
            🔄
          </button>
          
          {/* Deklanşör Butonu */}
          <div className="absolute bottom-20 left-0 right-0 flex justify-center z-20">
            <button 
              onClick={handleCapture} 
              className="w-22 h-22 p-2 bg-white/20 rounded-full border border-white/30 backdrop-blur-sm active:scale-90 transition-all"
            >
              <div className="w-full h-full bg-white rounded-full shadow-lg" />
            </button>
          </div>
        </>
      )}

      {/* Yükleme Ekranı */}
      <AnimatePresence>
        {uploading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 bg-black/70 backdrop-blur-lg flex flex-col items-center justify-center z-[10000]"
          >
            <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin mb-4" />
            <p className="text-white font-jetbrains text-[10px] tracking-[0.5em] uppercase">Processing Anı...</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Başarı Mesajı (Sadece Resim Çekilince) */}
      {capturedImage && !uploading && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center px-6">
           <button 
             onClick={() => setCapturedImage(null)}
             className="w-full py-4 bg-white text-black font-jetbrains text-[11px] font-bold rounded-2xl shadow-2xl active:scale-95 transition-transform uppercase tracking-widest"
           >
             Anı Paylaşıldı • Yeni Çek
           </button>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
