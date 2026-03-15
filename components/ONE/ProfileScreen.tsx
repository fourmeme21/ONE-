'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface ProfileScreenProps {
  sleepConfig: { start: string; end: string };
  onSleepChange: (config: { start: string; end: string }) => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

interface ProfileData {
  id: string;
  city: string;
  country: string;
  country_code: string;
  anonymous: boolean;
  is_premium: boolean;
  streak: number;
  moments_captured: number;
  reactions_received: number;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  sleepConfig,
  onSleepChange,
  isPremium = false,
  onUpgrade,
}) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingCity, setEditingCity] = useState(false);
  const [city, setCity] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Gerçek kullanıcı verisini Supabase'den çek
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setProfile(data);
        setCity(data.city || '');
        setIsAnonymous(data.anonymous || false);
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Şehir güncelle
  const handleCityUpdate = async () => {
    if (!city.trim() || !profile) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ city: city.trim() })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, city: city.trim() } : null);
      setEditingCity(false);
    } catch (err) {
      console.error('City update error:', err);
    }
  };

  // Anonim mod güncelle
  const handleAnonymousToggle = async (value: boolean) => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ anonymous: value })
        .eq('id', profile.id);

      if (error) throw error;
      setIsAnonymous(value);
      setProfile(prev => prev ? { ...prev, anonymous: value } : null);
    } catch (err) {
      console.error('Anonymous toggle error:', err);
    }
  };

  // Ülke kodu → bayrak emoji
  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode) return '🌍';
    const code = countryCode.trim().toUpperCase();
    return [...code].map(c =>
      String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))
    ).join('');
  };

  // reactions_received formatla
  const formatReactions = (count: number) => {
    if (!count) return '0';
    if (count >= 1000) return `${Math.floor(count / 1000)}k`;
    return count.toString();
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto bg-[var(--bg-deep)] rounded-2xl p-6 flex items-center justify-center h-48">
        <div className="font-jetbrains text-[10px] uppercase tracking-wider text-[var(--text-ghost)] animate-pulse">
          Loading reality...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full max-w-md mx-auto bg-[var(--bg-deep)] rounded-2xl p-6 flex items-center justify-center h-48">
        <div className="font-jetbrains text-[10px] uppercase tracking-wider text-red-400">
          Profile not found
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-[var(--bg-deep)] rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-subtle)]">
      {/* Header */}
      <motion.div
        className="relative h-24 bg-gradient-to-r from-[var(--accent-electric)] via-[var(--accent-pulse)] to-[var(--accent-flare)] p-6 flex items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
          <span className="text-lg font-bebas text-white">
            {(profile.city || '?')[0].toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-jetbrains text-[10px] text-white/80 uppercase tracking-[0.2em]">Authentic Profile</p>
          <p className="font-bebas text-xl text-white">
            {isAnonymous ? 'ANONYMOUS ENTITY' : (profile.city || 'UNKNOWN').toUpperCase()}
          </p>
        </div>
      </motion.div>

      <div className="p-6 space-y-6">

        {/* Uyku Ayarları */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-4"
        >
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

        {/* Konum */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
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
              <button
                onClick={handleCityUpdate}
                className="px-3 py-2 bg-[var(--accent-electric)] text-black rounded-lg font-jetbrains text-xs font-bold uppercase"
              >
                SAVE
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingCity(true)}
              className="w-full text-left px-3 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg font-dm-sans text-sm text-white hover:border-[var(--accent-electric)] transition-colors"
            >
              {profile.city || 'Unknown'} {getFlagEmoji(profile.country_code)}
            </button>
          )}
        </motion.div>

        {/* İstatistikler — Gerçek Veri */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]"
        >
          <div className="font-jetbrains text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-4">Meta Data</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="border-r border-[var(--border-subtle)]">
              <div className="font-bebas text-2xl text-[var(--accent-alive)]">{profile.streak || 0}</div>
              <div className="font-jetbrains text-[8px] text-[var(--text-ghost)] uppercase mt-1">Streak</div>
            </div>
            <div className="border-r border-[var(--border-subtle)]">
              <div className="font-bebas text-2xl text-[var(--accent-electric)]">{profile.moments_captured || 0}</div>
              <div className="font-jetbrains text-[8px] text-[var(--text-ghost)] uppercase mt-1">Reality</div>
            </div>
            <div>
              <div className="font-bebas text-2xl text-[var(--accent-pulse)]">{formatReactions(profile.reactions_received || 0)}</div>
              <div className="font-jetbrains text-[8px] text-[var(--text-ghost)] uppercase mt-1">Pulse</div>
            </div>
          </div>
        </motion.div>

        {/* Ghost Mode */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl"
        >
          <label className="font-jetbrains text-[10px] uppercase tracking-wider text-white">Ghost Mode</label>
          <motion.button
            onClick={() => handleAnonymousToggle(!isAnonymous)}
            className={`w-10 h-6 rounded-full border-2 flex items-center transition-colors ${
              isAnonymous
                ? 'bg-[var(--accent-electric)] border-[var(--accent-electric)] shadow-[0_0_10px_rgba(0,217,255,0.3)]'
                : 'bg-[var(--bg-deep)] border-[var(--border-subtle)]'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full"
              animate={{ x: isAnonymous ? 18 : 2 }}
              transition={{ duration: 0.2 }}
            />
          </motion.button>
        </motion.div>

        {/* Premium */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`border-2 rounded-xl p-4 relative overflow-hidden ${
            isPremium || profile.is_premium
              ? 'border-[var(--accent-alive)] bg-[var(--accent-alive)]/5'
              : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
          }`}
        >
          {isPremium || profile.is_premium ? (
            <div className="text-center">
              <div className="font-bebas text-lg text-[var(--accent-alive)]">ONE PREMIUM ACTIVE</div>
              <div className="font-jetbrains text-[9px] text-[var(--text-secondary)] mt-1 uppercase">Eternal Archive Access</div>
            </div>
          ) : (
            <div>
              <div className="font-bebas text-base text-white mb-2 tracking-wide">LEVEL UP REALITY</div>
              <div className="font-dm-sans text-[11px] text-[var(--text-secondary)] mb-4 leading-relaxed">
                Yearly recaps, spatial audio themes, and unlimited archive memory.
              </div>
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

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-3 pb-4"
        >
          <button className="text-center py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg font-jetbrains text-[9px] uppercase text-[var(--text-secondary)] hover:text-white">
            Privacy
          </button>
          <button className="text-center py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg font-jetbrains text-[9px] uppercase text-red-400 hover:bg-red-500/10 transition-colors">
            Terminate
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export { ProfileScreen };
export default ProfileScreen;
