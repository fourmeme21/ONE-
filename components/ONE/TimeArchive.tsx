`components/ONE/TimeArchive.tsx`

```tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PhotoData } from '@/lib/types';

interface TimeArchiveProps {
  photos?: PhotoData[];
  isPremium?: boolean;
  onUpgrade?: () => void;
}

const TimeArchive: React.FC<TimeArchiveProps> = ({ photos = [], isPremium = false, onUpgrade }) => {
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  const visiblePhotos = photos.slice(0, 30);
  const lockedPhotos = photos.length - 30;
  const statsData = {
    total: photos.length,
    countries: new Set(photos.map((p) => p.country)).size,
    year: new Date().getFullYear(),
  };

  const handleGenerateVideo = () => {
    setIsGeneratingVideo(true);
    setTimeout(() => setIsGeneratingVideo(false), 3000);
  };

  return (
    <motion.div className="w-full space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="space-y-2">
        <h1 className="font-bebas text-5xl text-white">Your Year in Moments</h1>
        <p className="font-jetbrains text-xs tracking-widest text-[var(--text-secondary)] uppercase">
          {statsData.total} moments · {statsData.countries} countries · {statsData.year}
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {visiblePhotos.map((photo, index) => (
            <motion.div
              key={photo.id || index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              className={`aspect-square rounded-lg overflow-hidden bg-gradient-to-br ${photo.gradient}`}
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs font-jetbrains text-white/50">{index + 1}</span>
              </div>
            </motion.div>
          ))}

          {!isPremium && lockedPhotos > 0 && Array.from({ length: Math.min(lockedPhotos, 15) }).map((_, index) => (
            <motion.div
              key={`locked-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (visiblePhotos.length + index) * 0.02 }}
              className="aspect-square rounded-lg overflow-hidden bg-[var(--bg-surface)] relative"
            >
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm flex items-center justify-center">
                <span className="text-lg">🔒</span>
              </div>
            </motion.div>
          ))}
        </div>

        {!isPremium && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-gradient-to-b from-transparent via-[var(--bg-deep)]/50 to-[var(--bg-deep)] flex flex-col items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-5xl">🔒</span>
            <div className="text-center">
              <p className="font-bebas text-xl text-white">Unlock Full Archive</p>
              <p className="font-dm-sans text-xs text-[var(--text-secondary)] mt-1">Get ONE Premium</p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="space-y-3">
        <motion.button
          onClick={handleGenerateVideo}
          disabled={isGeneratingVideo}
          className="w-full px-6 py-4 rounded-lg font-jetbrains text-sm font-bold tracking-wider uppercase bg-[var(--bg-surface)] text-white disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isGeneratingVideo ? 'Generating...' : 'Generate My Year Video'}
        </motion.button>

        {!isPremium && (
          <motion.button
            onClick={onUpgrade}
            className="w-full px-6 py-4 rounded-lg font-jetbrains text-sm font-bold tracking-wider uppercase bg-gradient-to-r from-[var(--accent-electric)] to-[var(--accent-pulse)] text-[var(--bg-void)]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Get ONE Premium — $9/month
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export { TimeArchive };
export default TimeArchive;
```
