'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PhotoData, EmojiType } from '@/lib/types';
import PhotoCard from './PhotoCard';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface GlobalFeedProps {
  photos?: PhotoData[];
  onFilterChange?: (filter: 'all' | 'nearby' | 'top') => void;
  activeFilter?: 'all' | 'nearby' | 'top';
}

const GlobalFeed: React.FC<GlobalFeedProps> = ({
  photos = [],
  onFilterChange,
  activeFilter = 'all',
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'nearby' | 'top'>(activeFilter);
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'nearby', label: 'Nearby' },
    { id: 'top', label: 'Top Reactions' },
  ] as const;

  const handleFilterChange = (filter: typeof filters[number]['id']) => {
    setSelectedFilter(filter);
    onFilterChange?.(filter);
  };

  return (
    <motion.div className="w-full space-y-6" variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={staggerItem} className="space-y-2">
        <h1 className="font-bebas text-4xl md:text-5xl text-white">Right now, across earth</h1>
        <div className="flex items-center gap-2">
          <motion.div
            className="w-3 h-3 rounded-full bg-green-500"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="font-jetbrains text-sm text-[var(--text-secondary)]">
            {photos.length} moments today
          </span>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="flex gap-2 flex-wrap">
        {filters.map((filter) => (
          <motion.button
            key={filter.id}
            onClick={() => handleFilterChange(filter.id)}
            className={`px-4 py-2 rounded-full font-jetbrains text-xs tracking-wider uppercase transition-all ${
              selectedFilter === filter.id
                ? 'bg-[var(--accent-electric)] text-[var(--bg-void)] font-bold'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
            } border border-transparent`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {filter.label}
          </motion.button>
        ))}
      </motion.div>

      {photos.length > 0 ? (
        <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <motion.div key={photo.id || index} variants={staggerItem} initial="hidden" animate="visible">
              <PhotoCard
                {...photo}
                onReact={(emoji: EmojiType) => console.log(`Reacted with ${emoji}`)}
                onReport={() => console.log(`Reported ${photo.id}`)}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="py-12 text-center">
          <p className="font-dm-sans text-[var(--text-secondary)]">No moments yet</p>
        </motion.div>
      )}

      {photos.length > 0 && (
        <motion.div variants={staggerItem} className="py-8 text-center">
          <motion.button
            className="px-6 py-3 border border-[var(--border-glow)] rounded-lg font-jetbrains text-sm text-[var(--accent-electric)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Load more moments
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export { GlobalFeed };
export default GlobalFeed;
```
