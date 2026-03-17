'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getTodayWindow, isWindowActive, DailyWindow } from '@/lib/supabase';

const stories = [
  { title: 'Instagram with X', subtitle: 'Filtered reality ends here', icon: '❌', gradient: 'linear-gradient(135deg, #D97706, #B45309)' },
  { title: '3 Seconds', subtitle: 'No second chances.', icon: '⏱️', gradient: 'linear-gradient(135deg, #0EA5E9, #2563EB)' },
  { title: '47 Countries', subtitle: 'Right now.', icon: '🌍', gradient: 'linear-gradient(135deg, #7C3AED, #6D28D9)' },
  { title: 'Real Humans', subtitle: 'Real moments.', icon: '❤️', gradient: 'linear-gradient(135deg, #EC4899, #BE185D)' },
];

const blockTheme = {
  sabah: { color: '#FFB347', label: 'Sabah Wave', icon: '🌅' },
  ogle:  { color: '#00D9FF', label: 'Öğle Wave',  icon: '☀️'  },
  aksam: { color: '#C084FC', label: 'Akşam Wave', icon: '🌆' },
};

const StoryFlowBanner: React.FC = () => {
  const [window_, setWindow_] = useState<DailyWindow | null>(null);
  const [active, setActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    getTodayWindow().then((win) => {
      setWindow_(win);
      setActive(isWindowActive(win));

      if (win?.window_end) {
        const tick = () => {
          const diff = new Date(win.window_end).getTime() - Date.now();
          if (diff <= 0) { setTimeLeft('00:00:00'); setActive(false); return; }
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
        };
        tick();
        const t = setInterval(tick, 1000);
        return () => clearInterval(t);
      }
    });
  }, []);

  const theme = window_?.block ? blockTheme[window_.block] : null;

  return (
    <div className="w-full space-y-5">

      {/* Pencere Bilgisi — aktifse göster */}
      {window_ && theme && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 flex items-center justify-between"
          style={{
            background: `linear-gradient(135deg, ${theme.color}22, ${theme.color}11)`,
            border: `1px solid ${theme.color}44`,
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{theme.icon}</span>
            <div>
              <p className="font-jetbrains text-xs uppercase tracking-widest font-bold" style={{ color: theme.color }}>
                {theme.label}
              </p>
              <p className="font-jetbrains text-[10px] text-white/50 mt-0.5">
                {active ? 'Pencere açık — şimdi çek!' : 'Pencere kapalı'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {active && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full"
                style={{ background: theme.color, boxShadow: `0 0 8px ${theme.color}` }}
              />
            )}
            <span className="font-jetbrains text-xs font-bold tabular-nums" style={{ color: theme.color }}>
              {timeLeft || '--:--:--'}
            </span>
          </div>
        </motion.div>
      )}

      <h2 className="font-bebas text-3xl text-white" style={{ letterSpacing: '0.05em' }}>
        The ONE Story
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-3" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {stories.map((story, index) => (
          <React.Fragment key={index}>
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex-shrink-0 rounded-2xl flex flex-col items-center justify-center text-center p-4 relative overflow-hidden"
              style={{ width: '140px', height: '180px', background: story.gradient }}
            >
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10 flex flex-col items-center gap-2">
                <span style={{ fontSize: '32px' }}>{story.icon}</span>
                <p className="font-bebas text-white text-lg leading-tight">{story.title}</p>
                <p className="font-jetbrains text-white/70 text-[10px] leading-snug">{story.subtitle}</p>
              </div>
            </motion.div>
            {index < stories.length - 1 && (
              <div className="flex-shrink-0 flex items-center text-[var(--text-ghost)] text-lg self-center">→</div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Countries', value: '47' },
          { label: 'Cities', value: '891' },
          { label: 'Moments', value: '2,847' },
          { label: 'Active Today', value: 'Live' },
        ].map((stat, i) => (
          <div key={i} className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center">
            <div className="font-bebas text-2xl text-[var(--accent-electric)]">{stat.value}</div>
            <div className="font-jetbrains text-[10px] text-[var(--text-ghost)] uppercase tracking-wider mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { StoryFlowBanner };
export default StoryFlowBanner;
