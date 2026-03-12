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
  const [countdown, setCountdown] = useState(initialCountdown);
  const [shouldShow, setShouldShow] = useState(isActive);

  useEffect(() => {
    if (!shouldShow) return;
    const timer = setTimeout(() => {
      if (countdown > 1) {
        setCountdown(countdown - 1);
      } else {
        setShouldShow(false);
        onCapture?.();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, shouldShow, onCapture]);

  useEffect(() => {
    setShouldShow(isActive);
    if (isActive) setCountdown(initialCountdown);
  }, [isActive, initialCountdown]);

  const getCountdownColor = () => {
    if (countdown === 3) return 'text-[var(--accent-alive)]';
    if (countdown === 2) return 'text-[var(--accent-pulse)]';
    return 'text-[var(--accent-electric)]';
  };

  const getRingColor = () => {
    if (countdown === 3) return 'from-[var(--accent-alive)]';
    if (countdown === 2) return 'from-[var(--accent-pulse)]';
    return 'from-[var(--accent-electric)]';
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <>
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-red-500 text-white py-4 px-6 text-center font-jetbrains font-bold tracking-widest z-40"
          >
            🔴 ONE — YOUR MOMENT IS NOW
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex flex-col items-center justify-center pt-20"
            onClick={onCapture}
          >
            <div className="relative w-64 h-64 flex items-center justify-center mb-12">
              {[0, 1, 2].map((ring) => (
                <motion.div
                  key={ring}
                  className={`absolute border-2 border-transparent rounded-full bg-gradient-to-r ${getRingColor()} to-transparent`}
                  style={{ width: `${180 - ring * 40}px`, height: `${180 - ring * 40}px` }}
                  animate={{ opacity: [0.8, 0.2, 0.8], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: ring * 0.2 }}
                />
              ))}

              <motion.div
                key={countdown}
                className={`font-bebas text-9xl font-bold ${getCountdownColor()} relative z-10`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {countdown}
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-jetbrains text-sm tracking-widest text-white absolute bottom-12 uppercase"
            >
              Look around you.
            </motion.p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { NotificationMoment };
export default NotificationMoment;
```
