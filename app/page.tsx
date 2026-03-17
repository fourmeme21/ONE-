'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadMoment, checkTodayCapture, getTodayWindow, isWindowActive, supabase, DailyWindow } from '@/lib/supabase';

import SplashScreen from '@/components/ONE/SplashScreen';
import NotificationMoment from '@/components/ONE/NotificationMoment';
import CameraCapture from '@/components/CameraCapture';
import GlobalFeed from '@/components/ONE/GlobalFeed';
import WorldHeatmap from '@/components/ONE/WorldHeatmap';
import TimeArchive from '@/components/ONE/TimeArchive';
import OnboardingFlow from '@/components/ONE/OnboardingFlow';
import AppNavigation from '@/components/ONE/AppNavigation';
import ProfileScreen from '@/components/ONE/ProfileScreen';
import StoryFlowBanner from '@/components/ONE/StoryFlowBanner';
import LoginButton from '@/components/LoginButton';

type TabType = 'feed' | 'map' | 'capture' | 'archive' | 'profile';

//  INTRO EKRANI 
const IntroScreen = ({ onEnter }: { onEnter: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[300] flex flex-col items-center justify-between px-8 py-16"
    style={{ background: '#05070F' }}
  >
    {/* Logo */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-col items-center gap-2 mt-8"
    >
      <h1
        className="font-bebas leading-none"
        style={{
          fontSize: 'clamp(96px, 28vw, 160px)',
          background: 'linear-gradient(135deg, #00D9FF 0%, #7C3AED 55%, #FF006E 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        ONE
      </h1>
    </motion.div>

    {/* Motto */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
      className="flex flex-col items-center gap-6 text-center"
    >
      <div className="space-y-1">
        <p className="font-bebas text-4xl text-white tracking-wide">The world.</p>
        <p className="font-bebas text-4xl tracking-wide" style={{ color: '#7C3AED' }}>Right now.</p>
        <p className="font-bebas text-4xl tracking-wide" style={{ color: '#00D9FF' }}>Unfiltered.</p>
      </div>

      {/* Konsept */}
      <div
        className="w-full rounded-2xl px-6 py-5 space-y-3"
        style={{ background: 'rgba(0,217,255,0.04)', border: '1px solid rgba(0,217,255,0.12)' }}
      >
        <p className="font-jetbrains text-[11px] text-white/50 uppercase tracking-[0.2em]">What is ONE?</p>
        <p className="font-dm-sans text-sm text-white/80 leading-relaxed">
          Every day, a window opens. The whole world captures the same moment — unfiltered, unedited, real.
        </p>
        <p className="font-dm-sans text-sm text-white/80 leading-relaxed">
          No followers. No algorithms. No performance. Just humanity, right now.
        </p>
        <p className="font-jetbrains text-[10px] text-white/30 uppercase tracking-wider mt-2">
          Your moments become your annual documentary.
        </p>
      </div>
    </motion.div>

    {/* Enter Butonu */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1 }}
      className="w-full"
    >
      <motion.button
        onClick={onEnter}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-4 rounded-2xl font-bebas text-2xl tracking-widest text-white"
        style={{
          background: 'linear-gradient(135deg, #00D9FF 0%, #7C3AED 100%)',
          boxShadow: '0 0 40px rgba(0,217,255,0.2)',
        }}
      >
        ENTER REALITY
      </motion.button>
      <p className="text-center font-jetbrains text-[9px] text-white/20 mt-3 uppercase tracking-widest">
        Humanity's diary — since 2026
      </p>
    </motion.div>
  </motion.div>
);

//  ANA UYGULAMA 
const ONEAppDemo = () => {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [showSplash, setShowSplash] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [todayWindow, setTodayWindow] = useState<DailyWindow | null>(null);
  const [windowActive, setWindowActive] = useState(false);
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

  //  DEKLK: Giri yaplmsa intro'yu atla 
  const handleSplashComplete = () => {
    setShowSplash(false);
    if (!user) {
      setShowIntro(true);
    }
    // user varsa showIntro false kalr, direkt feed alr
  };

  // Intro'yu kapat
  const handleIntroEnter = () => {
    setShowIntro(false);
  };

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
      const win = await getTodayWindow();
      setTodayWindow(win);
      setWindowActive(isWindowActive(win));

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

  const handleTabChange = (tab: TabType) => {
    if (tab === 'capture') {
      if (!user) {
        setUploadError("Sign in to capture your reality.");
        return;
      }
      if (!windowActive && todayWindow !== null) {
        setUploadError("The capture window is closed. Check back later.");
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
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const isFeedTab = activeTab === 'feed';
  const isReady = !showSplash && !showIntro;

  //  DEKLK: Feed ayr, dierleri ayr render 
  const renderOtherTabContent = () => {
    switch (activeTab) {
      case 'map':
        return (
          <motion.div key="map" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            <StoryFlowBanner />
            <WorldHeatmap />
          </motion.div>
        );
      case 'archive':
        return (
          <motion.div key="archive" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <TimeArchive />
          </motion.div>
        );
      case 'profile':
        return (
          <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ProfileScreen
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
    <div
      className="bg-[var(--bg-void)] text-white"
      style={{ height: '100dvh', overflow: 'hidden', position: 'relative' }}
    >
      {isReady && (
        <>
          {/*  FEED TAB: TAM EKRAN, PADDING YOK  */}
          {isFeedTab && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
              <GlobalFeed />
            </div>
          )}

          {/*  DER TAB'LAR: orijinal scroll layout  */}
          {!isFeedTab && (
            <div className="overflow-y-auto" style={{ height: '100dvh', paddingBottom: '80px' }}>

              {/* Mini Header */}
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

              {/* Tab erii */}
              <div ref={contentRef} className="mt-2 px-5">
                <AnimatePresence mode="wait">
                  {renderOtherTabContent()}
                </AnimatePresence>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] px-5 text-center pb-4">
                <p className="font-jetbrains text-xs text-[var(--text-ghost)]">The world. Right now. Unfiltered.</p>
              </div>
            </div>
          )}

          {/* Bottom Navigation  her zaman grnr */}
          <div className="fixed bottom-0 left-0 right-0 z-50">
            <AppNavigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
              hasNewMoments={showNotification}
            />
          </div>

          {/* Bildirim  sadece gsterir, kameray otomatik amaz */}
          <AnimatePresence>
            {showNotification && user && (
              <NotificationMoment
                isActive={true}
                onCapture={() => setShowNotification(false)}
              />
            )}
          </AnimatePresence>

          {/* Hata Mesaj */}
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

          {/* Kamera */}
          <AnimatePresence>
            {cameraOpen && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-0 z-[100] bg-black"
              >
                <button
                  onClick={() => { setCameraOpen(false); setActiveTab('feed'); }}
                  className="absolute top-12 left-6 z-[110] w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white"
                >
                  ✕
                </button>

                <CameraCapture
                  onCaptureComplete={async ({ blob, location, timestamp }) => {
                    setCameraOpen(false);
                    setActiveTab('feed');
                    setLastCapturedVideo(null);
                    setUploadError(null);
                    setUploadSuccess(false);
                    setShowVideoReview(true);
                    setUploading(true);

                    try {
                      const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
                      const file = new File([blob], `one_${Date.now()}.${ext}`, { type: blob.type });
                      const secureDate = timestamp instanceof Date ? timestamp : new Date();
                      const publicUrl = await uploadMoment(file, location, secureDate.toISOString());
                      setLastCapturedVideo(publicUrl);
                      setHasCapturedToday(true);
                      setUploadSuccess(true);
                    } catch (err: any) {
                      const url = URL.createObjectURL(blob);
                      setLastCapturedVideo(url);
                      setUploadError('Upload failed: ' + (err.message || 'Unknown error'));
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Review */}
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
                  {lastCapturedVideo && !uploading ? (
                    <div className="absolute inset-0 z-10" onClick={() => {
                      if (reviewVideoRef.current) {
                        reviewVideoRef.current.muted = !reviewVideoRef.current.muted;
                      }
                    }}>
                      <video
                        ref={reviewVideoRef}
                        key={lastCapturedVideo}
                        src={lastCapturedVideo}
                        playsInline autoPlay muted controls preload="auto"
                        onLoadedData={() => { reviewVideoRef.current?.play().catch(() => {}); }}
                        onEnded={() => {
                          if (reviewVideoRef.current) {
                            reviewVideoRef.current.currentTime = 0;
                            reviewVideoRef.current.play().catch(() => {});
                          }
                        }}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-cyan-400 font-jetbrains tracking-widest uppercase">Preparing...</p>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-4 left-0 right-0 flex justify-center z-20 pointer-events-none">
                    <span
                      className="text-[10px] tracking-[0.3em] uppercase font-light px-3 py-1 rounded-full"
                      style={{ color: '#00D9FF', background: 'rgba(0,0,0,0.6)', textShadow: '0 0 10px #00D9FF', border: '1px solid rgba(0,217,255,0.3)' }}
                    >
                      ONE · RAW REALITY
                    </span>
                  </div>

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

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 w-full max-w-sm px-4 py-3 rounded-2xl flex items-center gap-3"
                  style={{
                    background: uploading ? 'rgba(0,217,255,0.08)' : uploadSuccess ? 'rgba(34,197,94,0.12)' : uploadError ? 'rgba(239,68,68,0.12)' : 'rgba(0,217,255,0.08)',
                    border: uploading ? '1px solid rgba(0,217,255,0.25)' : uploadSuccess ? '1px solid rgba(34,197,94,0.35)' : uploadError ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(0,217,255,0.25)',
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
        </>
      )}

      {/* Splash */}
      <AnimatePresence>
        {showSplash && <SplashScreen duration={2000} onComplete={handleSplashComplete} />}
      </AnimatePresence>

      {/* Intro  sadece giri yaplmamsa */}
      <AnimatePresence>
        {showIntro && <IntroScreen onEnter={handleIntroEnter} />}
      </AnimatePresence>
    </div>
  );
};

export default ONEAppDemo;
