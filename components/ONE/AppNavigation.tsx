'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getTodayWindow, isWindowActive } from '@/lib/supabase';

interface AppNavigationProps {
  activeTab?: 'feed' | 'map' | 'capture' | 'archive' | 'profile';
  onTabChange?: (tab: 'feed' | 'map' | 'capture' | 'archive' | 'profile') => void;
  hasNewMoments?: boolean;
}

const tabs = [
  { id: 'feed' as const, label: 'Feed', icon: '🌍' },
  { id: 'map' as const, label: 'Map', icon: '📍' },
  { id: 'capture' as const, label: 'Capture', icon: '⭕' },
  { id: 'archive' as const, label: 'Archive', icon: '📅' },
  { id: 'profile' as const, label: 'Profile', icon: '👤' },
];

const AppNavigation: React.FC<AppNavigationProps> = ({ activeTab = 'feed', onTabChange, hasNewMoments = true }) => {
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const didFire = useRef<boolean>(false);
  const [windowOpen, setWindowOpen] = useState(false);

  useEffect(() => {
    getTodayWindow().then((win) => {
      setWindowOpen(isWindowActive(win));
    });
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    didFire.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent, tabId: 'feed' | 'map' | 'capture' | 'archive' | 'profile') => {
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX.current);
    if (deltaY > 15 || deltaX > 15) return;
    e.stopPropagation();
    didFire.current = true;
    onTabChange?.(tabId);
  };

  const handleClick = (e: React.MouseEvent, tabId: 'feed' | 'map' | 'capture' | 'archive' | 'profile') => {
    if (didFire.current) { didFire.current = false; return; }
    e.stopPropagation();
    onTabChange?.(tabId);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--bg-void)] to-[var(--bg-deep)] border-t border-[var(--border-subtle)] px-4 py-3 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isCapture = tab.id === 'capture';
          return (
            <motion.button
              key={tab.id}
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => handleTouchEnd(e, tab.id)}
              onClick={(e) => handleClick(e, tab.id)}
              className="relative flex flex-col items-center justify-center gap-1"
              whileTap={{ scale: 0.95 }}
            >
              {isCapture ? (
                // Capture butonu — pencere açıksa pulse
                <div className="relative flex items-center justify-center w-14 h-14">
                  {windowOpen && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ border: '2px solid #00D9FF' }}
                        animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ border: '2px solid #00D9FF' }}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                      />
                    </>
                  )}
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      border: `2px solid ${windowOpen ? '#00D9FF' : 'var(--accent-electric)'}`,
                      background: windowOpen ? 'rgba(0,217,255,0.1)' : 'transparent',
                    }}
                  >
                    <span className="text-xl" style={{ color: windowOpen ? '#00D9FF' : 'var(--text-ghost)' }}>
                      {tab.icon}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center w-8 h-8">
                  <span className={`text-xl ${isActive ? 'text-[var(--accent-electric)]' : 'text-[var(--text-ghost)]'}`}>
                    {tab.icon}
                  </span>
                </div>
              )}

              {!isCapture && (
                <span className={`font-jetbrains text-xs tracking-wider uppercase ${isActive ? 'text-[var(--accent-electric)]' : 'text-[var(--text-ghost)]'}`}>
                  {tab.label}
                </span>
              )}

              {tab.id === 'feed' && hasNewMoments && (
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
      <div className="h-2" />
    </div>
  );
};

export { AppNavigation };
export default AppNavigation;
