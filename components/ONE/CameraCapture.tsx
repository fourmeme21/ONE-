'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// Bağlantı bilgilerini direkt buraya gömdüm ki dosya yolu hatası olmasın
const supabase = createClient(
  'https://tyvezabojerfaxyctohm.supabase.co',
  'sb_publishable_1JoS_on8letn0YwSIhZMKA_l1F_f-b2'
);

const CameraCapture = ({ city = 'Istanbul', countryCode = 'TR' }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    async function start() {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    }
    start();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0, 400, 500);
    const imageData = canvasRef.current.toDataURL('image/jpeg', 0.7);
    setCapturedImage(imageData);

    try {
      setUploading(true);
      const res = await fetch(imageData);
      const blob = await res.blob();
      const fileName = `test-${Date.now()}.jpg`;

      const { data, error } = await supabase.storage
        .from('moments')
        .upload(fileName, blob, { contentType: 'image/jpeg' });

      if (error) throw error;
      alert("BAŞARILI! Dosya Supabase'e ulaştı: " + data.path);
    } catch (err: any) {
      alert("HATA: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative w-full aspect-[4/5] bg-black rounded-3xl overflow-hidden border border-white/10">
      <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${capturedImage ? 'hidden' : ''}`} />
      {capturedImage && <img src={capturedImage} className="w-full h-full object-cover" />}
      <canvas ref={canvasRef} width={400} height={500} className="hidden" />
      
      {!capturedImage && (
        <button onClick={handleCapture} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-blue-500" />
      )}
      
      {uploading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white font-bold">
          YÜKLENİYOR...
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
