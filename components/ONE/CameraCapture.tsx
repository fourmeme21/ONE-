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
  const containerRef = useRef<HTMLDivElement>(null);

  // Kamerayı Başlatma Fonksiyonu
  const startCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    try {
      const constraints = {
        video: { 
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Video yüklendiğinde oynatmayı garanti et
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error("Oynatma hatası:", e));
        };
      }
    } catch (err) {
      console.error("Kamera erişim hatası:", err);
    }
  };

  useEffect(() => {
    startCamera();
    return () => streamRef.current?.getTracks().forEach(track => track.stop());
  }, [mode]);

  // Resim çekilince odaklan
  useEffect(() => {
    if (capturedImage && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [capturedImage]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Canvas boyutlarını video ile eşitle
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Görüntüyü çiz
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imgData = canvas.toDataURL('image/jpeg', 0.8);
    
    setCapturedImage(imgData);
    setUploading(true);

    try {
      const res = await fetch(imgData);
      const blob = await res.blob();
      const fileName = `moment-${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from('moments')
        .upload(fileName, blob);

      if (error) throw error;
    } catch (e) {
      console.error("Yükleme hatası:", e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full flex justify-center py-4">
      <div 
        className={`relative transition-all duration-500 ease-in-out bg-black overflow-hidden shadow-2xl ${
          !capturedImage 
            ? 'fixed inset-0 z-[9999] w-full h-full' // Tam Ekran
            : 'w-[94%] aspect-[3/4] rounded-[2rem] relative z-10' // Küçük Kart
        }`}
      >
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover"
          style={{ display: capturedImage ? 'none' : 'block' }}
        />
        
        {capturedImage && (
          <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
        )}

        <canvas ref={canvasRef} className="hidden" />

        {!capturedImage && (
          <>
            {/* Üst Bilgiler */}
            <div className="absolute top-12 left-6 z-[10000] flex flex-col gap-1">
              <div className="bg-black/40 backdrop-blur-xl px-3 py-1 rounded-full border border-white/10 text-white text-[10px] font-mono tracking-widest uppercase">
                📍 {city}
              </div>
            </div>

            {/* Kamera Çevirme */}
            <button 
              onClick={(e) => { e.stopPropagation(); setMode(m => m === 'user' ? 'environment' : 'user'); }}
              className="absolute top-12 right-6 z-[10000] p-4 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-white text-xl active:scale-90 transition-transform"
            >
              🔄
            </button>

            {/* Deklanşör */}
            <div className="absolute bottom-16 left-0 right-0 flex justify-center z-[10000]">
              <button 
                onClick={handleCapture}
                className="w-20 h-20 bg-white rounded-full border-[6px] border-white/30 flex items-center justify-center active:scale-90 transition-transform"
              >
                <div className="w-14 h-14 bg-white rounded-full border-2 border-black/5" />
              </button>
            </div>
          </>
        )}

        {/* Yükleme Ekranı */}
        <AnimatePresence>
          {uploading && (
            <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-[10001]">
              <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
              <p className="text-white font-jetbrains text-[10px] tracking-[0.5em] uppercase">Processing</p>
            </motion.div>
          )}
        </AnimatePresence>

        {capturedImage && !uploading && (
          <div className="absolute bottom-6 left-6 right-6 z-20">
            <button 
              onClick={() => setCapturedImage(null)}
              className="w-full py-4 bg-white text-black font-jetbrains text-[11px] font-bold rounded-2xl uppercase tracking-widest"
            >
              YENİ ANI ÇEK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
