'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  title?: string;
  tagline?: string;
  duration?: number;
  onComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  title = 'ONE',
  tagline = '3 seconds. No filter. Real.',
  duration = 2000,
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
    <div className="relative w-full h-screen bg-gradient-to-br from-[#05070F] via-[#0D1229] to-[#05070F] overflow-hidden flex flex-col items-center justify-center">
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

      <motion.div className="mb-12" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
        <span className="text-7xl">🌍</span>
      </motion.div>

      <div className="flex gap-1 mb-6">
        {title.split('').map((letter, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.1 }}
            className="font-bebas text-8xl text-white tracking-tight"
          >
            {letter}
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="font-jetbrains text-sm tracking-widest text-[var(--text-secondary)] mb-16"
      >
        {tagline}
      </motion.p>

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
```
