'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getTodayWindow, isWindowActive, DailyWindow, supabase } from '@/lib/supabase';

const blockTheme = {
  sabah: { color: '#FFB347', label: 'Sabah Wave', icon: '🌅' },
  ogle:  { color: '#00D9FF', label: 'Öğle Wave',  icon: '☀️' },
  aksam: { color: '#C084FC', label: 'Akşam Wave', icon: '🌆' },
};

const StoryFlowBanner: React.FC = () => {
  const [window_, setWindow_] = useState<DailyWindow | null>(null);
  const [active, setActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [stats, setStats] = useState({ countries: 0, cities: 0, moments: 0 });

  useEffect(() => {
    // Pencere
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

    // Gerçek istatistikler
    const fetchStats = async () => {
      const { count: moments } = await supabase.from('posts').select('*', { count: 'exact', head: true });
      const { data: geoData } = await supabase.from('posts').select('country, city').not('country', 'is', null);
      const countries = new Set(geoData?.map((p: any) => p.country)).size;
      const cities = new Set(geoData?.map((p: any) => p.city).filter(Boolean)).size;
      setStats({ countries, cities, moments: moments || 0 });
    };
    fetchStats();
  }, []);

  const theme = window_?.block ? blockTheme[window_.block] : null;

  return (
    <div className="w-full space-y-4">

      {/* Pencere Kartı */}
      {window_ && theme ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 flex items-center justify-between"
          style={{
            background: active ? `linear-gradient(135deg, ${theme.color}22, ${theme.color}11)` : 'rgba(255,255,255,0.03)',
            border: active ? `1px solid ${theme.color}44` : '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl" style={{ filter: active ? 'none' : 'grayscale(1) opacity(0.4)' }}>{theme.icon}</span>
            <div>
              <p className="font-jetbrains text-xs uppercase tracking-widest font-bold" style={{ color: active ? theme.color : 'rgba(255,255,255,0.3)' }}>
                {theme.label}
              </p>
              <p className="font-jetbrains text-[10px] mt-0.5" style={{ color: active ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)' }}>
                {active ? 'Pencere açık — şimdi çek!' : 'Pencere kapandı — yarın yeni wave'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {active && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: theme.color, boxShadow: `0 0 8px ${theme.color}` }}
              />
            )}
            <span className="font-jetbrains text-xs font-bold tabular-nums" style={{ color: active ? theme.color : 'rgba(255,255,255,0.2)' }}>
              {timeLeft || '--:--:--'}
            </span>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <span className="text-2xl" style={{ filter: 'grayscale(1) opacity(0.4)' }}>🌊</span>
          <div>
            <p className="font-jetbrains text-xs uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>Wave Bekleniyor</p>
            <p className="font-jetbrains text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>Bugün henüz pencere oluşturulmadı</p>
          </div>
        </motion.div>
      )}

      {/* Gerçek İstatistikler */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Countries', value: stats.countries || '—' },
          { label: 'Cities', value: stats.cities || '—' },
          { label: 'Moments', value: stats.moments || '—' },
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
