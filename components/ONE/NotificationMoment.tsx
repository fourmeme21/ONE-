'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationMomentProps {
  isActive?: boolean;
  onCapture?: () => void;
  initialCountdown?: number;
}

const NotificationMoment: React.FC<NotificationMomentProps> = ({
  isActive = false,
  onCapture,
  initialCountdown = 3,
}) => {
  const [shouldShow, setShouldShow] = useState(isActive);

  useEffect(() => {
    setShouldShow(isActive);
  }, [isActive]);

  // 10 saniye sonra otomatik kapanır
  useEffect(() => {
    if (!shouldShow) return;
    const timer = setTimeout(() => {
      setShouldShow(false);
      onCapture?.();
    }, 10000);
    return () => clearTimeout(timer);
  }, [shouldShow, onCapture]);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-red-500 text-white py-4 px-6 text-center font-jetbrains font-bold tracking-widest z-40"
          onClick={() => { setShouldShow(false); onCapture?.(); }}
        >
          🔴 ONE — YOUR MOMENT IS NOW
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { NotificationMoment };
export default NotificationMoment;
