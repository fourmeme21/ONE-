'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/lib/types';

interface ProfileScreenProps {
  userProfile?: UserProfile;
  onProfileUpdate?: (profile: Partial<UserProfile>) => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
  // V3.1: Yeni proplar eklendi
  sleepConfig: { start: string; end: string };
  onSleepChange: (config: { start: string; end: string }) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile = {
    id: 'user-123',
    city: 'Istanbul',
    country: 'Turkey',
    countryCode: 'TR',
    anonymous: true,
    streak: 47,
    momentsCaptured: 184,
    reactionsReceived: 12847,
    isPremium: false,
    joinedDate: new Date(),
  },
  onProfileUpdate,
  isPremium = false,
  onUpgrade,
  sleepConfig,
  onSleepChange,
}) => {
  const [isAnonymous, setIsAnonymous] = useState(userProfile.anonymous);
  const [editingCity, setEditingCity] = useState(false);
  const [city, setCity] = useState(userProfile.city);

  const handleCityUpdate = () => {
    if (city.trim()) {
      onProfileUpdate?.({ city });
      setEditingCity(false);
    }
  };

  const handleAnonymousToggle = (value: boolean) => {
    setIsAnonymous(value);
    onProfileUpdate?.({ anonymous: value });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[var(--bg-deep)] rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-subtle)]">
      {/* Header Bölümü */}
      <motion.div
        className="relative h-24 bg-gradient-to-r from-[var(--accent-electric)] via-[var(--accent-pulse)] to-[var(--accent-flare)] p-6 flex items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
          <span className="text-lg font-bebas text-white">{userProfile.city[0].toUpperCase()}</span>
        </div>
        <div>
          <p className="font-jetbrains text-[10px] text-white/80 uppercase tracking-[0.2em]">Authentic Profile</p>
          <p className="font-bebas text-xl text-white">{isAnonymous ? 'ANONYMOUS ENTITY' : userProfile.city.toUpperCase()}</p>
        </div>
      </motion.div>

      <div className="p-6 space-y-6">
        
        {/* V3.1: UYKU AYARLARI (CRITICAL UPDATE) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <label className="font-jetbrains text-[10px] uppercase tracking-wider text-[var(--accent-electric)]">🌙 Sleep Schedule</label>
            <span className="text-[9px] text-[var(--text-ghost)] font-jetbrains tracking-tighter italic">No notifications during these hours</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="font-jetbrains text-[9px] text-[var(--text-secondary)] uppercase">Start</span>
              <input 
                type="time" 
                value={sleepConfig.start}
                onChange={(e) => onSleepChange({ ...sleepConfig, start: e.target.value })}
                className="w-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-jetbrains text-white focus:border-[var(--accent-pulse)] outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <span className="font-jetbrains text-[9px] text-[var(--text-secondary)] uppercase">End</span>
              <input 
                type="time" 
                value={sleepConfig.end}
                onChange={(e) => onSleepChange({ ...sleepConfig, end: e.target.value })}
                className="w-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-jetbrains text-white focus:border-[var(--accent-pulse)] outline-none transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Konum Bölümü */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
          <label className="font-jetbrains text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">📍 Current Reality</label>
          {editingCity ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-glow)] rounded-lg px-3 py-2 font-dm-sans text-sm text-white focus:outline-none"
                placeholder="Enter city"
                autoFocus
              />
              <button onClick={handleCityUpdate} className="px-3 py-2 bg-[var(--accent-electric)] text-black rounded-lg font-jetbrains text-xs font-bold uppercase">
                SAVE
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingCity(true)}
              className="w-full text-left px-3 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg font-dm-sans text-sm text-white hover:border-[var(--accent-electric)] transition-colors"
            >
              {city} 🇹🇷
            </button>
          )}
        </motion.div>

        {/* İstatistikler */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="font-jetbrains text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-4">Meta Data</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="border-r border-[var(--border-subtle)] last:border-0">
              <div className="font-bebas text-2xl text-[var(--accent-alive)]">{userProfile.streak}</div>
              <div className="font-jetbrains text-[8px] text-[var(--text-ghost)] uppercase mt-1">Streak</div>
            </div>
            <div className="border-r border-[var(--border-subtle)] last:border-0">
              <div className="font-bebas text-2xl text-[var(--accent-electric)]">{userProfile.momentsCaptured}</div>
              <div className="font-jetbrains text-[8px] text-[var(--text-ghost)] uppercase mt-1">Reality</div>
            </div>
            <div>
              <div className="font-bebas text-2xl text-[var(--accent-pulse)]">{Math.floor(userProfile.reactionsReceived / 1000)}k</div>
              <div className="font-jetbrains text-[8px] text-[var(--text-ghost)] uppercase mt-1">Pulse</div>
            </div>
          </div>
        </motion.div>

        {/* Anonim Mod Toggle */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex items-center justify-between p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl">
          <label className="font-jetbrains text-[10px] uppercase tracking-wider text-white">Ghost Mode</label>
          <motion.button
            onClick={() => handleAnonymousToggle(!isAnonymous)}
            className={`w-10 h-6 rounded-full border-2 flex items-center transition-colors ${
              isAnonymous ? 'bg-[var(--accent-electric)] border-[var(--accent-electric)] shadow-[0_0_10px_rgba(0,217,255,0.3)]' : 'bg-[var(--bg-deep)] border-[var(--border-subtle)]'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div className="w-4 h-4 bg-white rounded-full" animate={{ x: isAnonymous ? 18 : 2 }} transition={{ duration: 0.2 }} />
          </motion.button>
        </motion.div>

        {/* Premium Kartı */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`border-2 rounded-xl p-4 relative overflow-hidden ${isPremium ? 'border-[var(--accent-alive)] bg-[var(--accent-alive)]/5' : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'}`}
        >
          {isPremium ? (
            <div className="text-center">
              <div className="font-bebas text-lg text-[var(--accent-alive)]">ONE PREMIUM ACTIVE</div>
              <div className="font-jetbrains text-[9px] text-[var(--text-secondary)] mt-1 uppercase">Eternal Archive Access</div>
            </div>
          ) : (
            <div>
              <div className="font-bebas text-base text-white mb-2 tracking-wide">LEVEL UP REALITY</div>
              <div className="font-dm-sans text-[11px] text-[var(--text-secondary)] mb-4 leading-relaxed">Yearly recaps, spatial audio themes, and unlimited archive memory.</div>
              <motion.button
                onClick={onUpgrade}
                className="w-full bg-gradient-to-r from-[var(--accent-electric)] to-[var(--accent-pulse)] text-white py-3 rounded-lg font-jetbrains text-xs font-bold uppercase tracking-[0.1em] shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                UNFOLD PREMIUM — $9/MO
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Footer Linkleri */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="grid grid-cols-2 gap-3 pb-4">
          <button className="text-center py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg font-jetbrains text-[9px] uppercase text-[var(--text-secondary)] hover:text-white">Privacy</button>
          <button className="text-center py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg font-jetbrains text-[9px] uppercase text-red-400 hover:bg-red-500/10 transition-colors">Terminate</button>
        </motion.div>
      </div>
    </div>
  );
};

export { ProfileScreen };
export default ProfileScreen;
