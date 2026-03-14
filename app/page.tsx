'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadMoment, checkTodayCapture } from '@/lib/supabase'; 

import SplashScreen from '@/components/ONE/SplashScreen';
import NotificationMoment from '@/components/ONE/NotificationMoment';
import CameraCapture from '@/components/CameraCapture';
import EmojiReactionSystem from '@/components/ONE/EmojiReactionSystem';
import PhotoCard from '@/components/ONE/PhotoCard';
import GlobalFeed from '@/components/ONE/GlobalFeed';
import WorldHeatmap from '@/components/ONE/WorldHeatmap';
import TimeArchive from '@/components/ONE/TimeArchive';
import OnboardingFlow from '@/components/ONE/OnboardingFlow';
import AppNavigation from '@/components/ONE/AppNavigation';
import ProfileScreen from '@/components/ONE/ProfileScreen';
import StoryFlowBanner from '@/components/ONE/StoryFlowBanner';
import LoginButton from '@/components/LoginButton';
import { mockPhotos, mockCities, mockUserProfile } from '@/lib/mockData';

type TabType = 'feed' | 'map' | 'capture' | 'archive' | 'profile';

const ONEAppDemo = () => {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [showSplash, setShowSplash] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [hasCapturedToday, setHasCapturedToday] = useState(false);

  // V3.1: Kullanıcı tercihlerini hafızadan yükle veya varsayılanı ata
  const [sleepConfig, setSleepConfig] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('one_sleep_settings');
      return saved ? JSON.parse(saved) : { start: "23:00", end: "08:00" };
    }
    return { start: "23:00", end: "08:00" };
  });

  // Ayarlar değiştikçe yerel hafızayı güncelle
  useEffect(() => {
    localStorage.setItem('one_sleep_settings', JSON.stringify(sleepConfig));
  }, [sleepConfig]);

  useEffect(() => {
    const initDailyLogic = async () => {
      const captured = await checkTodayCapture();
      setHasCapturedToday(captured);

      if (!captured) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [sH, sM] = sleepConfig.start.split(':').map(Number);
        const [eH, eM] = sleepConfig.end.split(':').map(Number);
        const sleepStartMinutes = sH * 60 + sM;
        const sleepEndMinutes = eH * 60 + eM;

        let isSleeping = false;
        if (sleepStartMinutes > sleepEndMinutes) {
          isSleeping = currentTime >= sleepStartMinutes || currentTime < sleepEndMinutes;
        } else {
          isSleeping = currentTime >= sleepStartMinutes && currentTime < sleepEndMinutes;
        }

        if (!isSleeping) {
          const timer = setTimeout(() => setShowNotification(true), 5000);
          
          // V3.1: 75 SANİYE KURALI (75.000 ms) - Saf Gerçeklik Penceresi
          const expireTimer = setTimeout(() => setShowNotification(false), 75000);
          
          return () => {
            clearTimeout(timer);
            clearTimeout(expireTimer);
          };
        }
      }
    };
    initDailyLogic();
  }, [sleepConfig]);

  const handleTabChange = (tab: TabType) => {
    if (tab === 'capture') {
      if (hasCapturedToday) {
        alert("Today's reality is already captured.");
        return;
      }
      setCameraOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <motion.div key="feed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <GlobalFeed photos={mockPhotos} />
          </motion.div>
        );
      case 'map':
        return (
          <motion.div key="map" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <WorldHeatmap cities={mockCities} />
          </motion.div>
        );
      case 'capture':
        return null;
      case 'archive':
        return (
          <motion.div key="archive" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <TimeArchive photos={mockPhotos} isPremium={isPremium} onUpgrade={() => setIsPremium(true)} />
          </motion.div>
        );
      case 'profile':
        return (
          <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col items-center gap-4">
            <LoginButton />
            <ProfileScreen 
              userProfile={mockUserProfile} 
              isPremium={isPremium} 
              onUpgrade={() => setIsPremium(true)} 
              sleepConfig={sleepConfig}
              onSleepChange={setSleepConfig}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'feed' as TabType, label: '🌍 Feed' },
    { id: 'map' as TabType, label: '📍 Map' },
    { id: 'capture' as TabType, label: '⭕ Capture' },
    { id: 'archive' as TabType, label: '📅 Archive' },
    { id: 'profile' as TabType, label: '👤 Profile' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-void)] overflow-x-hidden text-white">
      <div className="pb-28">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="px-5 pt-10 pb-2">
          <h1 className="font-bebas leading-none" style={{ fontSize: 'clamp(72px, 20vw, 120px)', background: 'linear-gradient(135deg, #00D9FF 0%, #7C3AED 55%, #FF006E 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ONE
          </h1>
          <div className="flex justify-between items-center">
            <p className="font-jetbrains text-[10px] tracking-[0.25em] text-[var(--text-ghost)] uppercase mt-1">
              3 seconds. No filter. Real.
            </p>
            {hasCapturedToday && (
              <span className="text-[9px] px-2 py-0.5 rounded-full border border-green-500/50 text-green-400 bg-green-500/10">
                COMPLETED
              </span>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }} className="mt-6 px-5">
          <StoryFlowBanner />
        </motion.div>

        <div className="mt-8 px-5">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={activeTab === tab.id ? 'flex-shrink-0 px-4 py-2 rounded-xl font-jetbrains text-xs font-bold tracking-wider uppercase bg-[var(--accent-electric)] text-[var(--bg-void)] shadow-[0_0_15px_rgba(0,217,255,0.4)]' : 'flex-shrink-0 px-4 py-2 rounded-xl font-jetbrains text-xs font-bold tracking-wider uppercase bg-[var(--bg-surface)] text-[var(--text-secondary)]'}
                whileTap={{ scale: 0.95 }}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-6 px-5">
          <AnimatePresence mode="wait">
            {renderTabContent()}
          </AnimatePresence>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border-subtle)] px-5 space-y-8">
          <h2 className="font-bebas text-3xl">Component Showcase</h2>
          <div className="space-y-3">
            <h3 className="font-bebas text-lg text-[var(--accent-electric)]">Emoji Reactions</h3>
            <div className="p-5 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]">
              <EmojiReactionSystem reactionCounts={{ '❤️': 342, '😮': 89, '😂': 156, '🌍': 234, '🙏': 67 }} interactive={true} />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] px-5 text-center pb-4">
          <p className="font-jetbrains text-xs text-[var(--text-ghost)]">ONE — 3 seconds. No filter. Real.</p>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <AppNavigation activeTab={activeTab} onTabChange={handleTabChange} hasNewMoments={showNotification} />
      </div>

      <AnimatePresence>
        {showSplash && <SplashScreen duration={2000} onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showNotification && (
          <NotificationMoment 
            isActive={true} 
            onCapture={() => {
              setShowNotification(false);
              setCameraOpen(true);
            }} 
          />
        )}
      </AnimatePresence>

      {showOnboarding && <OnboardingFlow onComplete={() => setShowOnboarding(false)} />}

      <AnimatePresence>
        {cameraOpen && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-black"
          >
            <button
              onClick={() => { setCameraOpen(false); setActiveTab('feed'); }}
              className="absolute top-12 left-6 z-[110] w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white"
            >✕</button>

            <CameraCapture
              onCaptureComplete={async ({ blob, location, timestamp }) => {
                try {
                  setUploading(true);
                  const file = new File([blob], `one_${Date.now()}.mp4`, { type: blob.type });
                  await uploadMoment(file, location, timestamp);
                  setHasCapturedToday(true);
                } catch (err) {
                  console.error('Upload Error:', err);
                } finally {
                  setUploading(false);
                  setCameraOpen(false);
                  setActiveTab('feed');
                }
              }}
            />

            {uploading && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-[120]">
                <div className="w-12 h-12 border-2 border-[var(--accent-electric)] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-jetbrains text-xs tracking-widest text-[var(--accent-electric)] uppercase animate-pulse">
                  Uploading Reality...
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ONEAppDemo;
