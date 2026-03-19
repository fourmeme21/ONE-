'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  title?: string;
  duration?: number;
  onComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  title = 'ONE',
  duration = 2500,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (100 / (duration / 100));
        return next >= 100 ? 100 : next;
      });
    }, 100);

    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [duration, onComplete]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-[#05070F] via-[#0D1229] to-[#05070F] overflow-hidden flex flex-col items-center justify-center gap-0">
      
      {/* Arka plan animasyonu */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 50% 50%, rgba(0, 217, 255, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 50%, rgba(0, 217, 255, 0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Dünya */}
      <motion.div
        className="mb-8"
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-7xl">🌍</span>
      </motion.div>

      {/* ONE - harf harf */}
      <div className="flex gap-1 mb-5">
        {title.split('').map((letter, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.1 }}
            className="font-bebas text-9xl text-white tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #00D9FF 0%, #7C3AED 55%, #FF006E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {letter}
          </motion.div>
        ))}
      </div>

      {/* Motto */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="flex flex-col items-center gap-0.5 mb-5"
      >
        <p className="font-bebas text-2xl text-white tracking-widest">The world.</p>
        <p className="font-bebas text-2xl tracking-widest" style={{ color: '#7C3AED' }}>Right now.</p>
        <p className="font-bebas text-2xl tracking-widest" style={{ color: '#00D9FF' }}>Unfiltered.</p>
      </motion.div>

      {/* Slogan */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        className="font-jetbrains text-[11px] tracking-wider text-center px-8"
        style={{ color: 'rgba(255,0,110,0.8)' }}
      >
        Social media lied to you. ONE doesn&apos;t.
      </motion.p>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--border-subtle)]">
        <motion.div
          className="h-full bg-gradient-to-r from-[var(--accent-electric)] to-[var(--accent-pulse)]"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  );
};

export { SplashScreen };
export default SplashScreen;
