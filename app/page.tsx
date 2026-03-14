'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import AppNavigation from '@/components/ONE/AppNavigation';
import GlobalFeed from '@/components/ONE/GlobalFeed';
import ProfileScreen from '@/components/ONE/ProfileScreen';
import TimeArchive from '@/components/ONE/TimeArchive';
import WorldHeatmap from '@/components/ONE/WorldHeatmap';
import CameraCapture from '@/components/CameraCapture';

type Tab = 'feed' | 'map' | 'capture' | 'archive' | 'profile';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [lastCapture, setLastCapture] = useState<{
    blob: Blob;
    location: { lat: number; long: number } | null;
    timestamp: string;
  } | null>(null);

  const handleTabChange = (tab: Tab) => {
    if (tab === 'capture') {
      setCameraOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleCaptureComplete = ({
    blob,
    location,
    timestamp,
  }: {
    blob: Blob;
    location: { lat: number; long: number } | null;
    timestamp: string;
  }) => {
    setLastCapture({ blob, location, timestamp });
    setCameraOpen(false);
    setActiveTab('feed');

    // TODO: Supabase'e yükle
    // const file = new File([blob], `one_${Date.now()}.mp4`, { type: blob.type });
    // await supabase.storage.from('videos').upload(`uploads/${file.name}`, file);
  };

  const handleCameraClose = () => {
    setCameraOpen(false);
  };

  return (
    <main className="relative w-full overflow-hidden bg-[var(--bg-void)]" style={{ height: '100dvh' }}>

      {/* ── SAYFA İÇERİĞİ ── */}
      <div className="w-full h-full overflow-y-auto pb-24">
        {activeTab === 'feed' && <GlobalFeed />}
        {activeTab === 'map' && <WorldHeatmap />}
        {activeTab === 'archive' && <TimeArchive />}
        {activeTab === 'profile' && <ProfileScreen />}
      </div>

      {/* ── ALT NAVİGASYON ── */}
      <AppNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hasNewMoments={true}
      />

      {/* ── KAMERA OVERLAY ── */}
      {cameraOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Geri butonu */}
          <button
            onClick={handleCameraClose}
            className="absolute top-0 left-4 z-[110] flex items-center justify-center w-10 h-10"
            style={{
              paddingTop: 'env(safe-area-inset-top, 16px)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '24px',
            }}
            aria-label="Kamerayı kapat"
          >
            ✕
          </button>

          <CameraCapture onCaptureComplete={handleCaptureComplete} />
        </div>
      )}
    </main>
  );
}
