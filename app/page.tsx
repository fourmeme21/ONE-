'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { uploadMoment } from '@/lib/supabase'; 

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
  const [showSplash, setShowSplash] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

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
        // Kamera overlay açılır, tab içeriği boş kalır
        if (!cameraOpen) setCameraOpen(true);
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
            <ProfileScreen userProfile={mockUserProfile} isPremium={isPremium} onUpgrade={() => setIsPremium(true)} />
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
    <div className="min-h-screen bg-[var(--bg-void)] overflow-x-hidden">
      <div className="pb-28">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="px-5 pt-10 pb-2">
          <h1 className="font-bebas leading-none" style={{ fontSize: 'clamp(72px, 20vw, 120px)', background: 'linear-gradient(135deg, #00D9FF 0%, #7C3AED 55%, #FF006E 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ONE
          </h1>
          <p className="font-jetbrains text-[10px] tracking-[0.25em] text-[var(--text-ghost)] uppercase mt-1">
            3 seconds. No filter. Real.
          </p>
          <div className="mt-4">
            <LoginButton />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }} className="mt-6 px-5">
          <StoryFlowBanner />
        </motion.div>

        <div className="mt-8 px-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id ? 'flex-shrink-0 px-4 py-2 rounded-xl font-jetbrains text-xs font-bold tracking-wider uppercase bg-[var(--accent-electric)] text-[var(--bg-void)]' : 'flex-shrink-0 px-4 py-2 rounded-xl font-jetbrains text-xs font-bold tracking-wider uppercase bg-[var(--bg-surface)] text-[var(--text-secondary)]'}
                whileTap={{ scale: 0.95 }}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-6 px-5">{renderTabContent()}</div>

        <div className="mt-12 pt-8 border-t border-[var(--border-subtle)] px-5 space-y-8">
          <h2 className="font-bebas text-3xl text-white">Component Showcase</h2>
          <div className="space-y-3">
            <h3 className="font-bebas text-lg text-[var(--accent-electric)]">Emoji Reactions</h3>
            <div className="p-5 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]">
              <EmojiReactionSystem reactionCounts={{ '❤️': 342, '😮': 89, '😂': 156, '🌍': 234, '🙏': 67 }} interactive={true} />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-bebas text-lg text-[var(--accent-electric)]">Photo Cards</h3>
            <div className="grid grid-cols-2 gap-3">
              {mockPhotos.slice(0, 4).map((photo) => (
                <PhotoCard key={photo.id} {...photo} onReact={(emoji) => console.log('Reacted:', emoji)} onReport={() => console.log('Reported')} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] px-5 text-center pb-4">
          <p className="font-jetbrains text-xs text-[var(--text-ghost)]">ONE — 3 seconds. No filter. Real.</p>
        </div>
      </div>

      <div className="md:hidden">
        <AppNavigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'capture') { setCameraOpen(true); return; }
            setActiveTab(tab);
          }}
          hasNewMoments={false}
        />
      </div>

      {showSplash && <SplashScreen duration={2000} onComplete={() => setShowSplash(false)} />}
      {showNotification && <NotificationMoment isActive={true} onCapture={() => setShowNotification(false)} />}
      {showOnboarding && <OnboardingFlow onComplete={() => setShowOnboarding(false)} />}

      {cameraOpen && (
        <div className="fixed inset-0 z-[100]">
          <button
            onClick={() => { setCameraOpen(false); setActiveTab('feed'); }}
            aria-label="Kapat"
            style={{
              position: 'absolute',
              top: 'calc(env(safe-area-inset-top, 16px) + 8px)',
              left: '16px',
              zIndex: 110,
              color: 'rgba(255,255,255,0.8)',
              fontSize: '20px',
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >✕</button>
          <CameraCapture
            onCaptureComplete={async ({ blob, location, timestamp }: { blob: Blob; location: { lat: number; long: number } | null; timestamp: string }) => {
              try {
                setUploading(true);
                const file = new File([blob], `one_${Date.now()}.mp4`, { type: blob.type });
                await uploadMoment(file);
              } catch (err) {
                console.error('Yükleme hatası:', err);
              } finally {
                setUploading(false);
                setCameraOpen(false);
                setActiveTab('feed');
              }
            }}
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-[120]">
              <p className="font-jetbrains text-sm text-[var(--accent-electric)] animate-pulse">Yükleniyor...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ONEAppDemo;
