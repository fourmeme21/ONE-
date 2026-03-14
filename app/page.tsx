'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadMoment, checkTodayCapture, supabase } from '@/lib/supabase'; 

import SplashScreen from '@/components/ONE/SplashScreen';
import NotificationMoment from '@/components/ONE/NotificationMoment';
import CameraCapture from '@/components/CameraCapture';
import EmojiReactionSystem from '@/components/ONE/EmojiReactionSystem';
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
  const [lastCapturedVideo, setLastCapturedVideo] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showVideoReview, setShowVideoReview] = useState(false);

  const lastTapTimeRef = useRef<number>(0);
  const isScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [sleepConfig, setSleepConfig] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('one_sleep_settings');
      return saved ? JSON.parse(saved) : { start: "23:00", end: "08:00" };
    }
    return { start: "23:00", end: "08:00" };
  });

  useEffect(() => {
    localStorage.setItem('one_sleep_settings', JSON.stringify(sleepConfig));
  }, [sleepConfig]);

  useEffect(() => {
    const initDailyLogic = async () => {
      if (!user) return;
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
          const expireTimer = setTimeout(() => setShowNotification(false), 75000);
          return () => {
            clearTimeout(timer);
            clearTimeout(expireTimer);
          };
        }
      }
    };
    initDailyLogic();
  }, [sleepConfig, user]);

  const handleTabChange = (tab: TabType) => {
    if (tab === 'capture') {
      if (isScrollingRef.current) return;
      const now = Date.now();
      if (now - lastTapTimeRef.current < 300) return;
      lastTapTimeRef.current = now;

      if (!user) {
        setUploadError("Giriş yapmadan gerçekliği yakalayamazsınız.");
        return;
      }
      if (hasCapturedToday) return;
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
            <ProfileScreen 
              userProfile={user ? { ...mockUserProfile, email: user.email } : mockUserProfile} 
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
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="px-5 pt-10 pb-2 relative">
          
          <div className="absolute top-10 right-5 z-10 scale-90 origin-right flex items-center gap-3">
            {lastCapturedVideo && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setShowVideoReview(true)}
                className="w-12 h-12 rounded-lg border-2 border-[var(--accent-electric)] overflow-hidden bg-black shadow-lg"
              >
                <video src={lastCapturedVideo} autoPlay muted playsInline loop className="w-full h-full object-cover" />
              </motion.button>
            )}
            <LoginButton />
          </div>

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
                className={activeTab === tab.id
                  ? 'flex-shrink-0 px-4 py-2 rounded-xl font-jetbrains text-xs font-bold tracking-wider uppercase bg-[var(--accent-electric)] text-[var(--bg-void)] shadow-[0_0_15px_rgba(0,217,255,0.4)]'
                  : 'flex-shrink-0 px-4 py-2 rounded-xl font-jetbrains text-xs font-bold tracking-wider uppercase bg-[var(--bg-surface)] text-[var(--text-secondary)]'}
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

      {/* Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <AppNavigation activeTab={activeTab} onTabChange={handleTabChange} hasNewMoments={showNotification} />
        </div>
      </div>

      <AnimatePresence>
        {showSplash && <SplashScreen duration={2000} onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showNotification && user && (
          <NotificationMoment 
            isActive={true} 
            onCapture={() => {
              setShowNotification(false);
              setCameraOpen(true);
            }} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {uploadError && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-24 left-5 right-5 z-[200] p-4 bg-red-500/90 backdrop-blur-md rounded-2xl border border-white/20 text-white font-jetbrains text-xs shadow-2xl"
          >
            <div className="flex justify-between items-start gap-3">
              <p>{uploadError}</p>
              <button onClick={() => setUploadError(null)} className="shrink-0">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showOnboarding && <OnboardingFlow onComplete={() => setShowOnboarding(false)} />}

      {/* ─── KAMERA (Tam Ekran) ─────────────────────────────── */}
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
                  setUploadError(null);

                  const videoUrl = URL.createObjectURL(blob);
                  setLastCapturedVideo(videoUrl);

                  setCameraOpen(false);
                  setActiveTab('feed');

                  // Kısa gecikme: state settle olduktan sonra review aç
                  setTimeout(() => setShowVideoReview(true), 100);

                  const secureDate = timestamp instanceof Date ? timestamp : new Date();
                  const file = new File([blob], `one_${Date.now()}.mp4`, { type: blob.type });
                  await uploadMoment(file, location, secureDate.toISOString());
                  setHasCapturedToday(true);

                  setTimeout(() => setShowVideoReview(false), 8000);

                } catch (err: any) {
                  setUploadError("Upload failed: " + (err.message || "Unknown error"));
                  setLastCapturedVideo(null);
                  setShowVideoReview(false);
                } finally {
                  setUploading(false);
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── VİDEO REVIEW — Uygulama İçi Kart ─────────────── */}
      <AnimatePresence>
        {showVideoReview && lastCapturedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center px-6"
            style={{ background: 'rgba(5,7,15,0.88)', backdropFilter: 'blur(16px)' }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 40 }}
              transition={{ type: "spring", damping: 20, stiffness: 260 }}
              className="relative w-full max-w-sm rounded-3xl overflow-hidden"
              style={{
                border: '1.5px solid rgba(0,217,255,0.35)',
                boxShadow: '0 0 60px rgba(0,217,255,0.15), 0 24px 48px rgba(0,0,0,0.6)',
                height: '70vh',
              }}
            >
              {/* Video — fixed height, object-cover */}
              <video
                key={lastCapturedVideo}
                src={lastCapturedVideo}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />

              {/* Üst etiket */}
              <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
                <span
                  className="text-[10px] tracking-[0.3em] uppercase font-light px-3 py-1 rounded-full"
                  style={{
                    color: '#00D9FF',
                    background: 'rgba(0,0,0,0.5)',
                    textShadow: '0 0 10px #00D9FF',
                    border: '1px solid rgba(0,217,255,0.3)',
                  }}
                >
                  ONE · RAW REALITY
                </span>
              </div>

              {/* Alt badge */}
              <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col items-center gap-2 z-10">
                <div
                  className="px-5 py-2 rounded-full font-bold uppercase tracking-widest text-sm"
                  style={{
                    background: '#00D9FF',
                    color: '#05070F',
                    boxShadow: '0 0 20px rgba(0,217,255,0.6)',
                  }}
                >
                  ✓ REALITY CAPTURED
                </div>
                {uploading && (
                  <p className="text-[10px] text-cyan-400 font-jetbrains animate-pulse uppercase tracking-widest">
                    Yükleniyor...
                  </p>
                )}
                {!uploading && (
                  <p className="text-[10px] text-white/50 font-jetbrains uppercase tracking-widest">
                    Bugünkü anın kaydedildi
                  </p>
                )}
              </div>

              {/* Kapat */}
              <button
                onClick={() => setShowVideoReview(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm z-10"
                style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ONEAppDemo;
