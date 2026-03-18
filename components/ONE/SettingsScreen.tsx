'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface SettingsScreenProps {
  sleepConfig: { start: string; end: string };
  onSleepChange: (config: { start: string; end: string }) => void;
  isAnonymous: boolean;
  onAnonymousChange: (value: boolean) => void;
  onSignOut: () => void;
  onShowPrivacy: () => void;
  onShowTerms: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  sleepConfig,
  onSleepChange,
  isAnonymous,
  onAnonymousChange,
  onSignOut,
  onShowPrivacy,
  onShowTerms,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('posts').delete().eq('user_id', user.id);
      await supabase.from('reactions').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Delete account error:', err);
    }
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <p className="font-jetbrains text-[10px] uppercase tracking-widest text-white/30 px-1">{title}</p>
      <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
        {children}
      </div>
    </div>
  );

  const Row = ({ label, icon, right, onClick, danger = false }: {
    label: string; icon: string; right?: React.ReactNode; onClick?: () => void; danger?: boolean;
  }) => (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3.5 border-b border-white/5 last:border-0"
      style={{ background: 'transparent' }}
    >
      <div className="flex items-center gap-3">
        <span className="text-base">{icon}</span>
        <span className={`font-jetbrains text-xs tracking-wide ${danger ? 'text-red-400' : 'text-white/80'}`}>{label}</span>
      </div>
      {right}
    </motion.button>
  );

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <motion.button
      onClick={() => onChange(!value)}
      className="w-10 h-6 rounded-full flex items-center"
      style={{
        background: value ? 'var(--accent-electric)' : 'rgba(255,255,255,0.1)',
        border: value ? '1px solid var(--accent-electric)' : '1px solid rgba(255,255,255,0.15)',
      }}
    >
      <motion.div
        className="w-4 h-4 bg-white rounded-full shadow"
        animate={{ x: value ? 18 : 2 }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );

  return (
    <div className="w-full max-w-md mx-auto space-y-5 pb-4">
      <h1 className="font-bebas text-3xl text-white tracking-wide px-1">Settings</h1>

      {/* Notifications */}
      <Section title="Notifications">
        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-base">🌙</span>
              <span className="font-jetbrains text-xs text-white/80 tracking-wide">Sleep Schedule</span>
            </div>
            <span className="font-jetbrains text-[9px] text-white/30 italic">No alerts during these hours</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="font-jetbrains text-[9px] text-white/40 uppercase">Start</span>
              <input
                type="time"
                value={sleepConfig.start}
                onChange={(e) => onSleepChange({ ...sleepConfig, start: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-xs font-jetbrains text-white outline-none"
                style={{ background: 'var(--bg-deep)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            <div className="space-y-1">
              <span className="font-jetbrains text-[9px] text-white/40 uppercase">End</span>
              <input
                type="time"
                value={sleepConfig.end}
                onChange={(e) => onSleepChange({ ...sleepConfig, end: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-xs font-jetbrains text-white outline-none"
                style={{ background: 'var(--bg-deep)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Privacy */}
      <Section title="Privacy">
        <Row
          label="Ghost Mode"
          icon="👻"
          right={<Toggle value={isAnonymous} onChange={onAnonymousChange} />}
        />
      </Section>

      {/* Legal */}
      <Section title="Legal">
        <Row label="Privacy Policy" icon="🔒" onClick={onShowPrivacy} right={<span className="text-white/30 text-sm">›</span>} />
        <Row label="Terms of Service" icon="📄" onClick={onShowTerms} right={<span className="text-white/30 text-sm">›</span>} />
      </Section>

      {/* Account */}
      <Section title="Account">
        <Row label="Sign Out" icon="🚪" onClick={onSignOut} right={<span className="text-white/30 text-sm">›</span>} />
        <Row label="Delete Account" icon="⚠️" onClick={() => setShowDeleteConfirm(true)} danger />
      </Section>

      {/* Version */}
      <p className="text-center font-jetbrains text-[9px] text-white/20 uppercase tracking-widest pt-2">
        ONE v1.0 · one20.netlify.app
      </p>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm rounded-2xl p-6 space-y-4"
              style={{ background: 'var(--bg-deep)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <div className="text-center space-y-2">
                <span className="text-4xl">⚠️</span>
                <h2 className="font-bebas text-2xl text-white">Delete Account?</h2>
                <p className="font-dm-sans text-sm text-white/60 leading-relaxed">
                  This will permanently delete your account, all your moments, and your entire history. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-jetbrains text-xs uppercase tracking-wider text-white/60"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3 rounded-xl font-jetbrains text-xs uppercase tracking-wider text-white font-bold"
                  style={{ background: 'rgba(239,68,68,0.8)', border: '1px solid rgba(239,68,68,0.5)' }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { SettingsScreen };
export default SettingsScreen;
