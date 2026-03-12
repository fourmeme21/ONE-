'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraCaptureProps {
  city?: string;
  countryCode?: string;
  timeRemaining?: number;
  onCapture?: () => void;
  isDisabled?: boolean;
  isCaptured?: boolean;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  city = 'Istanbul',
  countryCode = 'TR',
  timeRemaining = 3,
  onCapture,
  isDisabled = false,
  isCaptured = false,
}) => {
  const [countdown, setCountdown] = useState(timeRemaining);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleCapture = () => {
    setShowFlash(true);
    onCapture?.();
    setTimeout(() => setShowFlash(false), 300);
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
      <div className="absolute inset-0 rounded-3xl border-2 border-[var(--border-subtle)] bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-deep)] overflow-hidden">
        <div className="absolute top-4 left-4 z-20">
          <div className="font-jetbrains text-xs tracking-widest text-[var(--accent-electric)] uppercase">
            📍 {city}, {countryCode}
          </div>
        </div>

        <motion.div className="absolute top-4 right-4 z-20" animate={{ scale: countdown === 0 ? [1, 1.2, 0.8, 1] : 1 }} transition={{ duration: 0.3 }}>
          <div className="bg-red-500 text-white px-3 py-1 rounded-full font-bebas text-sm font-bold">{countdown}s</div>
        </motion.div>

        {[
          { className: 'top-4 left-4', border: 'border-t-2 border-l-2' },
          { className: 'top-4 right-4', border: 'border-t-2 border-r-2' },
          { className: 'bottom-4 left-4', border: 'border-b-2 border-l-2' },
          { className: 'bottom-4 right-4', border: 'border-b-2 border-r-2' },
        ].map((bracket, i) => (
          <div key={i} className={`absolute w-8 h-8 ${bracket.className}`}>
            <div className={`absolute inset-0 ${bracket.border} border-[var(--accent-electric)]`} />
          </div>
        ))}

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isDisabled && !isCaptured && (
            <p className="font-jetbrains text-xs text-[var(--text-ghost)] uppercase tracking-wider">Already captured today</p>
          )}
          {isCaptured && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="text-5xl mb-2">✓</div>
              <p className="font-jetbrains text-xs text-[var(--accent-alive)] uppercase tracking-wider">Captured</p>
            </motion.div>
          )}
          {!isDisabled && !isCaptured && (
            <motion.p
              className="font-jetbrains text-xs text-[var(--text-secondary)] uppercase tracking-wider"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Look around you.
            </motion.p>
          )}
        </div>
      </div>

      {!isDisabled && (
        <motion.button
          onClick={handleCapture}
          disabled={isCaptured}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full border-2 border-white bg-transparent disabled:opacity-50 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-12 h-12 rounded-full border-2 border-white" />
        </motion.button>
      )}

      <AnimatePresence>
        {showFlash && (
          <motion.div
            className="absolute inset-0 rounded-3xl bg-white"
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
