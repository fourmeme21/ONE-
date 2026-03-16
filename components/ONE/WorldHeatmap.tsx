'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface MoodCity {
  city: string;
  country_code: string;
  lat: number;
  lng: number;
  moment_count: number;
  activity_level: 'hot' | 'warm' | 'cool';
}

const WorldHeatmap: React.FC = () => {
  const [cities, setCities] = useState<MoodCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCity, setHoveredCity] = useState<MoodCity | null>(null);

  useEffect(() => {
    const fetchMoodMap = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('mood_map_daily')
        .select('city, country_code, lat, lng, moment_count, activity_level')
        .eq('date', today)
        .order('moment_count', { ascending: false });

      if (!error && data) {
        setCities(data as MoodCity[]);
      }
      setLoading(false);
    };
    fetchMoodMap();
  }, []);

  const getCoordinates = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 400;
    return { x, y };
  };

  const getColor = (level: string) => {
    if (level === 'hot') return '#FF4D4D';
    if (level === 'warm') return '#FFB347';
    return '#00D9FF';
  };

  const totalMoments = cities.reduce((sum, c) => sum + c.moment_count, 0);
  const countryCount = new Set(cities.map(c => c.country_code)).size;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="font-jetbrains text-xs text-[var(--text-ghost)] uppercase tracking-widest">Loading world map...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full space-y-4 px-4 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center space-y-1 pt-4">
        <h1 className="font-bebas text-4xl text-white">World Heatmap</h1>
        <p className="font-jetbrains text-xs text-[var(--text-secondary)] uppercase tracking-widest">
          {countryCount} {countryCount === 1 ? 'country' : 'countries'} · {cities.length} cities · {totalMoments.toLocaleString()} moments today
        </p>
      </div>

      {/* Map */}
      <motion.div className="relative w-full bg-[var(--bg-surface)] rounded-2xl overflow-hidden border border-[var(--border-subtle)]">
        <svg viewBox="0 0 800 400" className="w-full h-auto">
          <defs>
            <filter id="glowFilter">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="800" height="400" fill="#05070F" />

          {/* Scan line animation */}
          <motion.line
            x1="0" y1="0" x2="0" y2="400"
            stroke="#00D9FF" strokeWidth="2" opacity="0.08"
            animate={{ x1: [0, 800], x2: [0, 800] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />

          {cities.length === 0 && (
            <text x="400" y="200" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontFamily="monospace" fontSize="14">
              No activity recorded today
            </text>
          )}

          {cities.map((city) => {
            const coords = getCoordinates(city.lat, city.lng);
            const color = getColor(city.activity_level);
            const isHovered = hoveredCity?.city === city.city;
            return (
              <g
                key={city.city + city.country_code}
                onMouseEnter={() => setHoveredCity(city)}
                onMouseLeave={() => setHoveredCity(null)}
                style={{ cursor: 'pointer' }}
              >
                {[2, 1, 0].map((ring) => (
                  <motion.circle
                    key={'ring-' + ring}
                    cx={coords.x} cy={coords.y}
                    r={20 + ring * 10}
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    opacity={0.3 - ring * 0.1}
                    animate={{ r: [20 + ring * 10, 30 + ring * 10, 20 + ring * 10] }}
                    transition={{ duration: 2, repeat: Infinity, delay: ring * 0.2 }}
                  />
                ))}
                <motion.circle
                  cx={coords.x} cy={coords.y}
                  r={isHovered ? 12 : 8}
                  fill={color}
                  filter="url(#glowFilter)"
                  transition={{ duration: 0.2 }}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredCity && (
          <motion.div
            className="absolute bottom-4 left-4 bg-[var(--bg-deep)] border border-[var(--border-glow)] rounded-lg p-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="font-bebas text-lg text-white">{hoveredCity.city}</div>
            <div className="font-jetbrains text-xs text-[var(--text-secondary)] mt-1">
              {hoveredCity.moment_count.toLocaleString()} moments today
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Legend */}
      <div className="flex gap-6 justify-center">
        {[
          { level: 'hot', color: '#FF4D4D', label: 'Hot' },
          { level: 'warm', color: '#FFB347', label: 'Warm' },
          { level: 'cool', color: '#00D9FF', label: 'Active' },
        ].map((item) => (
          <div key={item.level} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="font-jetbrains text-xs text-[var(--text-secondary)]">{item.label}</span>
          </div>
        ))}
      </div>

      {/* City list fallback if no map data */}
      {cities.length === 0 && (
        <div className="text-center py-8">
          <span className="text-4xl">🌍</span>
          <p className="font-jetbrains text-xs text-[var(--text-secondary)] mt-3 uppercase tracking-widest">
            No moments captured today yet
          </p>
        </div>
      )}
    </motion.div>
  );
};

export { WorldHeatmap };
export default WorldHeatmap;
