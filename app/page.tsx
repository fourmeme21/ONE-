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
  const [lastCapturedBlob, setLastCapturedBlob] = useState<Blob | null>(null);
  const [lastCapturedVideo, setLastCapturedVideo] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showVideoReview, setShowVideoReview] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const reviewVideoRef = useRef<HTMLVideoElement>(null);
  const isScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll tracking
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

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setHasCapturedToday(false);
  }, [user]);

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
          return () => { clearTimeout(timer); clearTimeout(expireTimer); };
        }
      }
    };
    initDailyLogic();
  }, [sleepConfig, user]);

  // Tab değişince içerik alanına scroll et
  const handleTabChange = (tab: TabType) => {
    if (tab === 'capture') {
      if (!user) {
        setUploadError("Sign in to capture your reality.");
        return;
      }
      if (hasCapturedToday) {
        setUploadError("You already captured today's moment. See you tomorrow. 🌍");
        return;
      }
      setCameraOpen(true);
      return;
    }
    setActiveTab(tab);
    // Feed dışında scroll en üste, feed'de de üste
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  // Feed tabında hero + content, diğerlerinde sadece content
  const isFeedTab = activeTab === 'feed';

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
      case 'archive':
        return (
          <motion.div key="archive" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <TimeArchive photos={mockPhotos} isPremium={isPremium} onUpgrade={() => setIsPremium(true)} />
          </motion.div>
        );
      case 'profile':
        return (
          <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
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

  return (
    <div className="min-h-screen bg-[var(--bg-void)] overflow-x-hidden text-white">
      {/* ─── SAYFA İÇERİĞİ ─── */}
      <div className="pb-28">

        {/* ─── HERO — Sadece Feed tabında görünür ─── */}
        <AnimatePresence>
          {isFeedTab && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="px-5 pt-10 pb-2 relative"
            >
              {/* Sağ üst: Video önizleme + Login */}
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

              <h1
                className="font-bebas leading-none"
                style={{
                  fontSize: 'clamp(72px, 20vw, 120px)',
                  background: 'linear-gradient(135deg, #00D9FF 0%, #7C3AED 55%, #FF006E 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
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
          )}
        </AnimatePresence>

        {/* ─── Feed dışı tablarda küçük başlık ─── */}
        <AnimatePresence>
          {!isFeedTab && (
            <motion.div
              key="mini-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-5 pt-8 pb-2 flex items-center justify-between"
            >
              <button
                onClick={() => handleTabChange('feed')}
                className="font-bebas text-3xl"
                style={{
                  background: 'linear-gradient(135deg, #00D9FF 0%, #7C3AED 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ONE
              </button>
              <div className="flex items-center gap-3">
                {lastCapturedVideo && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={() => setShowVideoReview(true)}
                    className="w-10 h-10 rounded-lg border-2 border-[var(--accent-electric)] overflow-hidden bg-black shadow-lg"
                  >
                    <video src={lastCapturedVideo} autoPlay muted playsInline loop className="w-full h-full object-cover" />
                  </motion.button>
                )}
                <LoginButton />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── StoryFlow Banner — Sadece Feed'de ─── */}
        {isFeedTab && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-4 px-5"
          >
            <StoryFlowBanner />
          </motion.div>
        )}

        {/* ─── TAB İÇERİĞİ — Her zaman sayfanın üstünde, görünür alanda ─── */}
        <div ref={contentRef} className="mt-4 px-5">
          <AnimatePresence mode="wait">
            {renderTabContent()}
          </AnimatePresence>
        </div>

        {/* ─── Emoji Showcase — Sadece Feed'de ─── */}
        {isFeedTab && (
          <div className="mt-10 pt-8 border-t border-[var(--border-subtle)] px-5 space-y-4">
            <h3 className="font-bebas text-lg text-[var(--accent-electric)]">Emoji Reactions</h3>
            <div className="p-5 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]">
              <EmojiReactionSystem
                reactionCounts={{ '❤️': 342, '😮': 89, '😂': 156, '🌍': 234, '🙏': 67 }}
                interactive={true}
              />
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] px-5 text-center pb-4">
          <p className="font-jetbrains text-xs text-[var(--text-ghost)]">ONE — 3 seconds. No filter. Real.</p>
        </div>
      </div>

      {/* ─── BOTTOM NAVIGATION — md:hidden kaldırıldı, her zaman görünür ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <AppNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hasNewMoments={showNotification}
        />
      </div>

      {/* ─── SPLASH ─── */}
      <AnimatePresence>
        {showSplash && <SplashScreen duration={2000} onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {/* ─── BİLDİRİM ─── */}
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

      {/* ─── HATA MESAJI ─── */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-5 right-5 z-[200] p-4 bg-[#0a0a0a]/95 backdrop-blur-md rounded-2xl border border-red-500/50 text-white font-jetbrains text-xs shadow-2xl"
          >
            <div className="flex justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-base">⚠</span>
                <p className="text-red-300">{uploadError}</p>
              </div>
              <button
                onClick={() => setUploadError(null)}
                className="shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
              >✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showOnboarding && <OnboardingFlow onComplete={() => setShowOnboarding(false)} />}

      {/* ─── KAMERA — Tam Ekran, alttan açılır ─── */}
      <AnimatePresence>
        {cameraOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-black"
          >
            {/* Kapat butonu */}
            <button
              onClick={() => { setCameraOpen(false); setActiveTab('feed'); }}
              className="absolute top-12 left-6 z-[110] w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white"
            >
              ✕
            </button>

            <CameraCapture
              onCaptureComplete={async ({ blob, location, timestamp }) => {
                // 1. Kamerayı kapat, feed'e dön
                setCameraOpen(false);
                setActiveTab('feed');

                // 2. Blob'u sakla, review'i aç
                setLastCapturedBlob(blob);
                setLastCapturedVideo(null); // önce temizle
                setUploadError(null);
                setUploadSuccess(false);
                setShowVideoReview(true);

                // 3. Kısa gecikme sonra URL oluştur — kamera stream kapanmasını bekle
                setTimeout(() => {
                  const url = URL.createObjectURL(blob);
                  setLastCapturedVideo(url);
                }, 300);

                // 4. Supabase upload
                try {
                  setUploading(true);
                  // webm veya mp4 — blob.type'tan al
                  const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
                  const file = new File([blob], `one_${Date.now()}.${ext}`, { type: blob.type });
                  const secureDate = timestamp instanceof Date ? timestamp : new Date();
                  await uploadMoment(file, location, secureDate.toISOString());
                  setHasCapturedToday(true);
                  setUploadSuccess(true);
                } catch (err: any) {
                  setUploadError('Upload failed: ' + (err.message || 'Unknown error'));
                } finally {
                  setUploading(false);
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── VİDEO REVIEW — Kayıt sonrası uygulama içi görünüm ─── */}
      <AnimatePresence>
        {showVideoReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex flex-col items-center justify-center px-6"
            style={{ background: 'rgba(5,7,15,0.92)', backdropFilter: 'blur(20px)' }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 40 }}
              transition={{ type: 'spring', damping: 20, stiffness: 260 }}
              className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-black"
              style={{
                border: '1.5px solid rgba(0,217,255,0.35)',
                boxShadow: '0 0 60px rgba(0,217,255,0.15), 0 24px 48px rgba(0,0,0,0.6)',
                height: '65vh',
              }}
            >
              {/* Video — src hazır değilse spinner göster */}
              {lastCapturedVideo ? (
                <video
                  ref={reviewVideoRef}
                  key={lastCapturedVideo}
                  src={lastCapturedVideo}
                  playsInline
                  controls
                  autoPlay
                  loop
                  preload="auto"
                  onLoadedData={() => {
                    reviewVideoRef.current?.play().catch(() => {});
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 1,
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-cyan-400 font-jetbrains tracking-widest uppercase">Preparing...</p>
                  </div>
                </div>
              )}

              {/* Üst etiket — video üzerinde hafif */}
              <div className="absolute top-4 left-0 right-0 flex justify-center z-20 pointer-events-none">
                <span
                  className="text-[10px] tracking-[0.3em] uppercase font-light px-3 py-1 rounded-full"
                  style={{
                    color: '#00D9FF',
                    background: 'rgba(0,0,0,0.6)',
                    textShadow: '0 0 10px #00D9FF',
                    border: '1px solid rgba(0,217,255,0.3)',
                  }}
                >
                  ONE · RAW REALITY
                </span>
              </div>

              {/* Kapat */}
              <button
                onClick={() => {
                  setShowVideoReview(false);
                  if (lastCapturedVideo) URL.revokeObjectURL(lastCapturedVideo);
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm z-20"
                style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                ✕
              </button>
            </motion.div>

            {/* Upload durum kartı — video kartının altında */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 w-full max-w-sm px-4 py-3 rounded-2xl flex items-center gap-3"
              style={{
                background: uploading
                  ? 'rgba(0,217,255,0.08)'
                  : uploadSuccess
                  ? 'rgba(34,197,94,0.12)'
                  : uploadError
                  ? 'rgba(239,68,68,0.12)'
                  : 'rgba(0,217,255,0.08)',
                border: uploading
                  ? '1px solid rgba(0,217,255,0.25)'
                  : uploadSuccess
                  ? '1px solid rgba(34,197,94,0.35)'
                  : uploadError
                  ? '1px solid rgba(239,68,68,0.35)'
                  : '1px solid rgba(0,217,255,0.25)',
              }}
            >
              {uploading && (
                <>
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <p className="text-xs text-cyan-400 font-jetbrains tracking-widest uppercase">Uploading to Supabase...</p>
                </>
              )}
              {!uploading && uploadSuccess && (
                <>
                  <span className="text-green-400 text-lg shrink-0">✓</span>
                  <div>
                    <p className="text-xs text-green-400 font-jetbrains tracking-widest uppercase font-bold">Saved</p>
                    <p className="text-[10px] text-white/40 font-jetbrains mt-0.5">Uploaded to Supabase Storage & DB</p>
                  </div>
                </>
              )}
              {!uploading && uploadError && (
                <>
                  <span className="text-red-400 text-lg shrink-0">✗</span>
                  <div>
                    <p className="text-xs text-red-400 font-jetbrains tracking-widest uppercase font-bold">Error</p>
                    <p className="text-[10px] text-white/40 font-jetbrains mt-0.5">{uploadError}</p>
                  </div>
                </>
              )}
              {!uploading && !uploadSuccess && !uploadError && (
                <p className="text-xs text-white/40 font-jetbrains tracking-widest uppercase">Waiting...</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ONEAppDemo;
