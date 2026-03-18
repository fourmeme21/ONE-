'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getTodayWindow, isWindowActive, DailyWindow } from '@/lib/supabase';

const blockTheme = {
  sabah: { color: '#FFB347', label: 'Morning Wave', icon: '🌅' },
  ogle:  { color: '#00D9FF', label: 'Midday Wave',  icon: '☀️' },
  aksam: { color: '#C084FC', label: 'Evening Wave', icon: '🌆' },
};

const WindowCountdown: React.FC = () => {
  const [window_, setWindow_] = useState<DailyWindow | null>(null);
  const [active, setActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState('--:--:--');

  useEffect(() => {
    getTodayWindow().then((win) => {
      setWindow_(win);
      const isActive = isWindowActive(win);
      setActive(isActive);

      if (!win) return;

      const target = isActive ? new Date(win.window_end) : new Date(win.window_start);

      const tick = () => {
        const diff = target.getTime() - Date.now();
        if (diff <= 0) {
          setTimeLeft('00:00:00');
          // Aktifse kapandı, değilse açıldı
          setActive(isWindowActive(win));
          return;
        }
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
      };

      tick();
      const t = setInterval(tick, 1000);
      return () => clearInterval(t);
    });
  }, []);

  if (!window_) return null;

  const theme = blockTheme[window_.block];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${active ? theme.color + '66' : 'rgba(255,255,255,0.1)'}`,
      }}
    >
      {active ? (
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.85, 1.2, 0.85] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 6, height: 6, borderRadius: '50%', background: theme.color, boxShadow: `0 0 8px ${theme.color}`, flexShrink: 0 }}
        />
      ) : (
        <span className="text-xs" style={{ flexShrink: 0 }}>{theme.icon}</span>
      )}
      <span className="font-jetbrains text-[10px] uppercase tracking-tighter font-medium" style={{ color: active ? theme.color : 'rgba(255,255,255,0.4)' }}>
        {active ? `${theme.label}` : `Next: ${theme.label}`}
      </span>
      <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
      <span className="font-jetbrains text-[10px] font-bold tabular-nums" style={{ color: active ? theme.color : 'rgba(255,255,255,0.3)' }}>
        {timeLeft}
      </span>
    </motion.div>
  );
};

export { WindowCountdown };
export default WindowCountdown;
