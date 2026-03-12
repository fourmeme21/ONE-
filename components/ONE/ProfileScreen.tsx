'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/lib/types';

interface ProfileScreenProps {
  userProfile?: UserProfile;
  onProfileUpdate?: (profile: Partial<UserProfile>) => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
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
    <div className="w-full max-w-md mx-auto bg-[var(--bg-deep)] rounded-2xl overflow-hidden">
      <motion.div
        className="relative h-24 bg-gradient-to-r from-[var(--accent-electric)] via-[var(--accent-pulse)] to-[var(--accent-flare)] p-6 flex items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
          <span className="text-lg font-bebas">{userProfile.city[0].toUpperCase()}</span>
        </div>
        <div>
          <p className="font-jetbrains text-xs text-white/80 uppercase tracking-wider">Your Profile</p>
          <p className="font-bebas text-lg text-white">{isAnonymous ? 'Anonymous' : userProfile.city}</p>
        </div>
      </motion.div>

      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
          <label className="font-jetbrains text-xs uppercase tracking-wider text-[var(--text-secondary)]">📍 Current Location</label>
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
              <button onClick={handleCityUpdate} className="px-3 py-2 bg-[var(--accent-electric)] text-black rounded-lg font-jetbrains text-xs font-bold">
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingCity(true)}
              className="w-full text-left px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg font-dm-sans text-white"
            >
              {userProfile.country} 🇹🇷
            </button>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[var(--bg-surface)] rounded-lg p-4">
          <div className="font-jetbrains text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3">Your Stats</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="font-bebas text-2xl text-[var(--accent-alive)]">{userProfile.streak}</div>
              <div className="font-jetbrains text-xs text-[var(--text-ghost)] uppercase mt-1">Day Streak</div>
            </div>
            <div>
              <div className="font-bebas text-2xl text-[var(--accent-electric)]">{userProfile.momentsCaptured}</div>
              <div className="font-jetbrains text-xs text-[var(--text-ghost)] uppercase mt-1">Moments</div>
            </div>
            <div>
              <div className="font-bebas text-2xl text-[var(--accent-pulse)]">{Math.floor(userProfile.reactionsReceived / 1000)}k</div>
              <div className="font-jetbrains text-xs text-[var(--text-ghost)] uppercase mt-1">Reactions</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-lg">
          <label className="font-dm-sans text-sm text-white">Anonymous Mode</label>
          <motion.button
            onClick={() => handleAnonymousToggle(!isAnonymous)}
            className={`w-10 h-6 rounded-full border-2 flex items-center transition-colors ${
              isAnonymous ? 'bg-[var(--accent-electric)] border-[var(--accent-electric)]' : 'bg-[var(--bg-deep)] border-[var(--border-subtle)]'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div className="w-4 h-4 bg-white rounded-full" animate={{ x: isAnonymous ? 18 : 2 }} transition={{ duration: 0.2 }} />
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`border-2 rounded-lg p-4 ${isPremium ? 'border-[var(--accent-alive)] bg-[var(--accent-alive)]/5' : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'}`}
        >
          {isPremium ? (
            <div className="text-center">
              <div className="font-bebas text-lg text-[var(--accent-alive)]">ONE Premium</div>
              <div className="font-jetbrains text-xs text-[var(--text-secondary)] mt-1">Active • Year Video + Archiving</div>
            </div>
          ) : (
            <div>
              <div className="font-bebas text-base text-white mb-2">Unlock Premium</div>
              <div className="font-dm-sans text-xs text-[var(--text-secondary)] mb-3">Get unlimited year videos, archive storage, and exclusive features.</div>
              <motion.button
                onClick={onUpgrade}
                className="w-full bg-gradient-to-r from-[var(--accent-electric)] to-[var(--accent-pulse)] text-white py-2 rounded-lg font-jetbrains text-xs font-bold uppercase tracking-wider"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Premium — $9/mo
              </motion.button>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-2">
          <button className="w-full text-left px-3 py-2 bg-[var(--bg-surface)] rounded-lg font-dm-sans text-sm text-[var(--text-secondary)]">⚙️ Notification Settings</button>
          <button className="w-full text-left px-3 py-2 bg-[var(--bg-surface)] rounded-lg font-dm-sans text-sm text-[var(--text-secondary)]">🔒 Privacy & Safety</button>
          <button className="w-full text-left px-3 py-2 bg-[var(--bg-surface)] rounded-lg font-dm-sans text-sm text-red-400">🗑️ Delete Account</button>
        </motion.div>
      </div>
    </div>
  );
};

export { ProfileScreen };
export default ProfileScreen;
```
