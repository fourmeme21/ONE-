'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PhotoData, EmojiType } from '@/lib/types';
import EmojiReactionSystem from './EmojiReactionSystem';

interface PhotoCardProps extends Partial<PhotoData> {
  onReact?: (emoji: EmojiType) => void;
  onReport?: () => void;
  interactive?: boolean;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  gradient = 'from-blue-600 to-purple-600',
  city = 'Istanbul',
  countryCode = 'TR',
  timeAgo = '2m ago',
  reactions = { '❤️': 342, '😮': 89, '😂': 156, '🌍': 234, '🙏': 67 },
  userReaction = null,
  onReact,
  onReport,
  interactive = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative w-full aspect-square rounded-2xl overflow-hidden"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-transparent to-transparent" />

      <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
        <div className="flex items-start justify-between">
          <p className="font-jetbrains text-xs tracking-widest text-white uppercase">
            📍 {city}, {countryCode}
          </p>
          {interactive && (
            <motion.button
              onClick={onReport}
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="px-2 py-1 rounded text-xs text-[var(--text-ghost)] pointer-events-auto"
            >
              Report
            </motion.button>
          )}
        </div>

        <div className="space-y-3">
          <p className="font-dm-sans text-xs italic text-[var(--text-ghost)]">{timeAgo}</p>
          {interactive && (
            <motion.div
              initial={{ opacity: 0.3 }}
              animate={{ opacity: isHovered ? 1 : 0.3 }}
              className="pointer-events-auto"
            >
              <EmojiReactionSystem
                onReact={onReact}
                userReaction={userReaction}
                reactionCounts={reactions}
                interactive={true}
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export { PhotoCard };
export default PhotoCard;
