'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { EmojiType } from '@/lib/types';
import EmojiReactionSystem from './EmojiReactionSystem';

interface VideoCardProps {
  id: string;
  fileUrl: string;
  city?: string | null;
  country?: string | null;
  countryCode?: string | null;
  capturedAt?: string;
  reactionHeart?: number;
  reactionWow?: number;
  reactionHaha?: number;
  reactionWorld?: number;
  reactionPray?: number;
  userReaction?: EmojiType | null;
  onReact?: (postId: string, emoji: EmojiType) => void;
  onReport?: (postId: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({
  id,
  fileUrl,
  city,
  country,
  countryCode,
  capturedAt,
  reactionHeart = 0,
  reactionWow = 0,
  reactionHaha = 0,
  reactionWorld = 0,
  reactionPray = 0,
  userReaction = null,
  onReact,
  onReport,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const reactionCounts = {
    '❤️': reactionHeart,
    '😮': reactionWow,
    '😂': reactionHaha,
    '🌍': reactionWorld,
    '🙏': reactionPray,
  };

  const timeAgo = capturedAt ? formatTimeAgo(new Date(capturedAt)) : '';

  const handleTap = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    setShowReactions(true);
  };

  return (
    <motion.div
      className="relative w-full rounded-2xl overflow-hidden bg-black"
      style={{ aspectRatio: '9/16' }}
      whileTap={{ scale: 0.98 }}
      onClick={handleTap}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={fileUrl}
        playsInline
        muted
        preload="metadata"
        loop
        onEnded={() => setIsPlaying(false)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

      {/* Play icon — sadece duraklatılmışsa */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center">
            <span className="text-white text-xl ml-1">▶</span>
          </div>
        </div>
      )}

      {/* Üst — konum */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-jetbrains tracking-widest text-white uppercase">
            📍 {city || 'Unknown'}{countryCode ? `, ${countryCode}` : ''}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onReport?.(id); }}
          className="text-[9px] text-white/40 font-jetbrains"
        >
          ···
        </button>
      </div>

      {/* Alt — zaman + reaksiyonlar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 space-y-2">
        <p className="font-jetbrains text-[9px] text-white/50 uppercase tracking-widest">{timeAgo}</p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showReactions ? 1 : 0.4 }}
          onClick={(e) => e.stopPropagation()}
        >
          <EmojiReactionSystem
            onReact={(emoji) => onReact?.(id, emoji)}
            userReaction={userReaction}
            reactionCounts={reactionCounts}
            interactive={true}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default VideoCard;
