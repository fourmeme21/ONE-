'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CityData } from '@/lib/types';

interface WorldHeatmapProps {
  cities?: CityData[];
  onCityHover?: (city: CityData | null) => void;
}

const WorldHeatmap: React.FC<WorldHeatmapProps> = ({ cities = [], onCityHover }) => {
  const [hoveredCity, setHoveredCity] = useState<CityData | null>(null);

  const handleCityHover = (city: CityData | null) => {
    setHoveredCity(city);
    onCityHover?.(city);
  };

  const getCoordinates = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 400;
    return { x, y };
  };

  const totalMoments = cities.reduce((sum, city) => sum + city.momentCount, 0);

  return (
    <motion.div className="w-full space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="text-center space-y-2">
        <h1 className="font-bebas text-4xl text-white">World Heatmap</h1>
        <p className="font-jetbrains text-xs text-[var(--text-secondary)] uppercase tracking-widest">
          {new Set(cities.map((c) => c.countryCode)).size} countries · {cities.length} cities · {totalMoments.toLocaleString()} moments
        </p>
      </div>

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
          <rect width="800" height="400" fill="var(--bg-deep)" />

          <motion.line
            x1="0" y1="0" x2="0" y2="400"
            stroke="var(--accent-electric)" strokeWidth="2" opacity="0.1"
            animate={{ x1: 800, x2: 800 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />

          {cities.map((city) => {
            const coords = getCoordinates(city.lat, city.lng);
            const isHovered = hoveredCity?.countryCode === city.countryCode;
            const color = city.activityLevel === 'hot' ? 'var(--accent-flare)' : city.activityLevel === 'warm' ? 'var(--accent-warm)' : 'var(--accent-electric)';
            return (
              <g key={city.countryCode} onMouseEnter={() => handleCityHover(city)} onMouseLeave={() => handleCityHover(null)} style={{ cursor: 'pointer' }}>
                {[2, 1, 0].map((ring) => (
                  <motion.circle
                    key={`ring-${ring}`}
                    cx={coords.x} cy={coords.y} r={20 + ring * 10}
                    fill="none" stroke={color} strokeWidth="1" opacity={0.3 - ring * 0.1}
                    animate={{ r: [20 + ring * 10, 30 + ring * 10, 20 + ring * 10] }}
                    transition={{ duration: 2, repeat: Infinity, delay: ring * 0.2 }}
                  />
                ))}
                <motion.circle
                  cx={coords.x} cy={coords.y} r={8}
                  fill={color} filter="url(#glowFilter)"
                  animate={isHovered ? { r: 12 } : { r: 8 }}
                  transition={{ duration: 0.2 }}
                />
              </g>
            );
          })}
        </svg>

        {hoveredCity && (
          <motion.div
            className="absolute bottom-4 left-4 bg-[var(--bg-deep)] border border-[var(--border-glow)] rounded-lg p-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="font-bebas text-lg text-white">{hoveredCity.name} {hoveredCity.emoji}</div>
            <div className="font-jetbrains text-xs text-[var(--text-secondary)] mt-1">{hoveredCity.momentCount.toLocaleString()} moments today</div>
          </motion.div>
        )}
      </motion.div>

      <div className="flex gap-6 justify-center">
        {[
          { level: 'hot', color: 'bg-[var(--accent-flare)]', label: 'Hot' },
          { level: 'warm', color: 'bg-[var(--accent-warm)]', label: 'Warm' },
          { level: 'cool', color: 'bg-[var(--accent-electric)]', label: 'Active' },
        ].map((item) => (
          <div key={item.level} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            <span className="font-jetbrains text-xs text-[var(--text-secondary)]">{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export { WorldHeatmap };
export default WorldHeatmap;
