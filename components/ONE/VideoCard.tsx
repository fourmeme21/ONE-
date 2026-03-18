'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { EmojiType } from '@/lib/types';

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

const EMOJIS: { emoji: EmojiType; key: string }[] = [
  { emoji: '❤️', key: 'heart' },
  { emoji: '😮', key: 'wow' },
  { emoji: '😂', key: 'haha' },
  { emoji: '🌍', key: 'world' },
  { emoji: '🙏', key: 'pray' },
];

const VideoCard: React.FC<VideoCardProps> = ({
  id,
  fileUrl,
  city,
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
  const [isMuted, setIsMuted] = useState(true);

  const counts: Record<EmojiType, number> = {
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
      // İlk play'de sesi aç
      setIsMuted(false);
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <motion.div
      className="relative w-full rounded-none overflow-hidden bg-black"
      style={{ height: '100%', width: '100%' }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Video — başlangıçta muted (autoplay policy), tıklanınca ses açılır */}
      <video
        ref={videoRef}
        src={fileUrl}
        playsInline
        muted={isMuted}
        preload="metadata"
        onClick={handleTap}
        onEnded={() => { setIsPlaying(false); }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          cursor: 'pointer',
        }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.85) 100%)' }}
      />

      {/* Play butonu */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          onClick={handleTap}
          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255,255,255,0.4)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}
          >
            <span className="text-3xl ml-1" style={{ color: '#ffffff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>▶</span>
          </div>
        </div>
      )}

      {/* Ses göstergesi — sağ üst */}
      {isPlaying && (
        <button
          className="absolute top-2 right-8 z-10 p-1.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}
          onClick={(e) => {
            e.stopPropagation();
            if (videoRef.current) {
              const newMuted = !isMuted;
              videoRef.current.muted = newMuted;
              setIsMuted(newMuted);
            }
          }}
        >
          <span className="text-sm">{isMuted ? '🔇' : '🔊'}</span>
        </button>
      )}

      {/* Üst — konum + rapor */}
      <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10 pointer-events-none">
        <span
          className="text-[9px] font-jetbrains tracking-wider text-white uppercase"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
        >
          📍 {city || '?'}{countryCode ? `, ${countryCode}` : ''}
        </span>
        <button
          className="text-white/40 text-xs pointer-events-auto"
          onClick={(e) => { e.stopPropagation(); onReport?.(id); }}
        >
          ···
        </button>
      </div>

      {/* Alt — zaman + reaksiyonlar — video oynarken gizle */}
      <div className={`absolute bottom-16 left-4 right-4 z-10 space-y-3 transition-opacity duration-300 ${isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <p className="font-jetbrains text-[10px] text-white/60 uppercase tracking-widest">{timeAgo}</p>
        <div className="flex gap-2 flex-wrap">
          {EMOJIS.map(({ emoji }) => {
            const count = counts[emoji];
            const isSelected = userReaction === emoji;
            return (
              <button
                key={emoji}
                onClick={(e) => { e.stopPropagation(); onReact?.(id, emoji); }}
                className="flex items-center gap-1 px-3 py-2 rounded-full"
                style={{
                  background: isSelected ? 'rgba(0,217,255,0.3)' : 'rgba(0,0,0,0.6)',
                  border: isSelected ? '1.5px solid rgba(0,217,255,0.8)' : '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span className="text-xl">{emoji}</span>
                {count > 0 && (
                  <span className="font-jetbrains text-xs text-white/80 font-bold">{count}</span>
                )}
              </button>
            );
          })}
        </div>
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
