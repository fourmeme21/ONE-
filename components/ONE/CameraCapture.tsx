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
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [mode, setMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const start = async () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } } 
        });
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (e) { console.error(e); }
    };
    start();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, [mode]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Video oranına göre canvas boyutlandırma
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    const img = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(img);
    setStatus('uploading');

    try {
      const res = await fetch(img);
      const blob = await res.blob();
      const { error } = await supabase.storage.from('moments').upload(`${Date.now()}.jpg`, blob);
      if (error) throw error;
      setStatus('success');
    } catch (e) {
      setStatus('idle');
    }
  };

  return (
    <motion.div 
      layout // Framer Motion ile yumuşak geçiş sağlar
      className={`relative overflow-hidden shadow-2xl transition-all duration-500 ease-in-out ${
        capturedImage 
          ? 'mx-auto w-[90%] aspect-[4/5] rounded-[2.5rem] mt-10' // Resim çekilince küçülen kart
          : 'fixed inset-0 w-full h-full z-[100] rounded-0' // Çekim anında tam ekran vizör
      } bg-black`}
    >
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className={`w-full h-full object-cover ${capturedImage ? 'hidden' : ''}`} 
      />
      
      {capturedImage && (
        <motion.img 
          initial={{ scale: 1.1 }} 
          animate={{ scale: 1 }} 
          src={capturedImage} 
          className="w-full h-full object-cover" 
        />
      )}
      
      <canvas ref={canvasRef} className="hidden" />

      {/* Üst Panel (Tam Ekran Modunda Görünür) */}
      {!capturedImage && (
        <div className="absolute top-12 inset-x-0 px-6 flex justify-between items-center z-20">
          <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <span className="text-white font-jetbrains text-[10px] tracking-widest uppercase">
              📍 {city}, {countryCode}
            </span>
          </div>
          <button 
            onClick={() => setMode(m => m === 'user' ? 'environment' : 'user')} 
            className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 active:scale-90"
          >
            <span className="text-xl text-white">🔄</span>
          </button>
        </div>
      )}

      {/* Deklanşör (Tam Ekran Modunda Alt Kısım) */}
      {!capturedImage && (
        <div className="absolute bottom-16 inset-x-0 flex justify-center z-20">
          <button 
            onClick={handleCapture} 
            className="group relative w-20 h-20 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-white/20 rounded-full scale-125 animate-pulse" />
            <div className="w-16 h-16 bg-white rounded-full border-[4px] border-black/10 group-active:scale-90 transition-transform" />
          </button>
        </div>
      )}

      {/* Durum Göstergeleri */}
      <AnimatePresence>
        {status === 'uploading' && (
          <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
            <p className="text-white font-jetbrains text-[8px] tracking-[0.5em] uppercase">Processing</p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="absolute bottom-0 inset-x-0 bg-[var(--accent-electric)] p-8 z-[60] flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bebas text-3xl text-black">MOMENT SAVED</h3>
              <span className="text-xl">⚡</span>
            </div>
            <button 
              onClick={() => { setCapturedImage(null); setStatus('idle'); }} 
              className="w-full py-4 bg-black text-white font-jetbrains text-[10px] rounded-xl uppercase tracking-widest active:scale-95 transition-transform"
            >
              Take Another One
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CameraCapture;
