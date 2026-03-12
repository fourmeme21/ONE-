'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmojiType, ReactionCounts } from '@/lib/types';

interface EmojiReactionSystemProps {
  onReact?: (emoji: EmojiType) => void;
  userReaction?: EmojiType | null;
  reactionCounts?: ReactionCounts;
  interactive?: boolean;
}

const EMOJIS: EmojiType[] = ['❤️', '😮', '😂', '🌍', '🙏'];

const EmojiReactionSystem: React.FC<EmojiReactionSystemProps> = ({
  onReact,
  userReaction = null,
  reactionCounts = { '❤️': 342, '😮': 89, '😂': 156, '🌍': 234, '🙏': 67 },
  interactive = true,
}) => {
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: EmojiType; x: number; y: number }[]>([]);

  const handleReact = (emoji: EmojiType, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const id = `${emoji}-${Date.now()}`;
    setFloatingReactions((prev) => [...prev, { id, emoji, x: rect.left + rect.width / 2, y: rect.top }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 1200);
    onReact?.(emoji);
  };

  return (
    <div className="relative">
      <div className="flex gap-2 flex-wrap">
        {EMOJIS.map((emoji) => {
          const isSelected = userReaction === emoji;
          const count = reactionCounts[emoji] || 0;
          return (
            <motion.button
              key={emoji}
              onClick={(e) => handleReact(emoji, e)}
              disabled={!interactive}
              className={`relative px-3 py-2 rounded-full font-dm-sans text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-[var(--accent-electric)] to-[var(--accent-pulse)] text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
              }`}
              whileHover={interactive ? { scale: 1.05, y: -2 } : {}}
              whileTap={interactive ? { scale: 0.95 } : {}}
            >
              <span className="mr-1">{emoji}</span>
              {count > 0 && (
                <span className="font-jetbrains text-xs">{count}</span>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {floatingReactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            className="fixed pointer-events-none text-2xl font-bold"
            initial={{ x: reaction.x, y: reaction.y, opacity: 1, scale: 1 }}
            animate={{ y: reaction.y - 100, opacity: 0, scale: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            +1
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export { EmojiReactionSystem };
export default EmojiReactionSystem;
