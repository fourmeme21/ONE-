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

  useEffect(() => {
    async function setupCamera() {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => videoRef.current?.play();
        }
      } catch (err) { console.error("Kamera hatası:", err); }
    }
    setupCamera();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, [mode]);

  useEffect(() => {
    if (capturedImage && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [capturedImage]);

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
      await supabase.storage.from('moments').upload(`moment-${Date.now()}.jpg`, blob);
    } catch (e) { console.error(e); }
    setUploading(false);
  };

  // Dinamik Stiller
  const fullscreenStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    borderRadius: 0
  };

  const cardStyle: React.CSSProperties = {
    position: 'relative',
    width: '94%',
    aspectRatio: '3/4',
    margin: '20px auto',
    borderRadius: '32px',
    zIndex: 10
  };

  return (
    <div ref={containerRef} className="w-full min-h-[200px] flex items-center justify-center">
      <div 
        style={capturedImage ? cardStyle : fullscreenStyle}
        className="bg-black overflow-hidden shadow-2xl transition-all duration-500 ease-in-out"
      >
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ width: '100%', height: '100%', objectCover: 'cover', display: capturedImage ? 'none' : 'block' }}
        />
        
        {capturedImage && <img src={capturedImage} className="w-full h-full object-cover" />}
        <canvas ref={canvasRef} className="hidden" />

        {!capturedImage && (
          <div className="absolute inset-0 z-[10000] pointer-events-none">
            <div className="absolute top-12 left-6 pointer-events-auto">
              <div className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 text-white text-[10px] uppercase tracking-widest">
                📍 {city}
              </div>
            </div>
            
            <button 
              onClick={() => setMode(m => m === 'user' ? 'environment' : 'user')}
              className="absolute top-12 right-6 pointer-events-auto p-4 bg-white/10 rounded-full text-white text-xl"
            >
              🔄
            </button>

            <div className="absolute bottom-20 inset-x-0 flex justify-center pointer-events-auto">
              <button 
                onClick={handleCapture}
                className="w-20 h-20 bg-white rounded-full border-[6px] border-white/30 active:scale-90 transition-transform"
              />
            </div>
          </div>
        )}

        <AnimatePresence>
          {uploading && (
            <motion.div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-[10001]">
              <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
              <p className="text-white font-mono text-[10px] tracking-widest uppercase">Saving...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {capturedImage && !uploading && (
          <div className="absolute bottom-6 left-6 right-6">
            <button 
              onClick={() => setCapturedImage(null)}
              className="w-full py-4 bg-white text-black font-bold rounded-2xl uppercase tracking-tighter shadow-2xl"
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
