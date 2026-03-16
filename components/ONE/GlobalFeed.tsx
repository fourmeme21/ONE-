'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { EmojiType } from '@/lib/types';
import VideoCard from './VideoCard';

type FilterType = 'all' | 'nearby' | 'top';

interface Post {
  id: string;
  file_url: string;
  city: string | null;
  country: string | null;
  country_code: string | null;
  captured_at: string;
  reaction_heart: number;
  reaction_wow: number;
  reaction_haha: number;
  reaction_world: number;
  reaction_pray: number;
  userReaction?: EmojiType | null;
}

interface CityBlock {
  city: string;
  country_code: string | null;
  count: number;
}

interface CountryBlock {
  country: string;
  country_code: string | null;
  count: number;
  cities: CityBlock[];
}

const PAGE_SIZE = 10;

// Ülke kodu → bayrak emoji
const getFlag = (code: string | null) => {
  if (!code) return '🌍';
  return [...code.trim().toUpperCase()]
    .map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)))
    .join('');
};

const GlobalFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userReactions, setUserReactions] = useState<Record<string, EmojiType>>({});

  // Ülke / şehir blokları
  const [countries, setCountries] = useState<CountryBlock[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Kullanıcı bilgisi
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => {
        if (d.latitude && d.longitude) {
          setUserCoords({ lat: d.latitude, lng: d.longitude });
        }
      })
      .catch(() => {});
  }, []);

  // Ülke → şehir hiyerarşisini çek
  useEffect(() => {
    const fetchCountries = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('city, country, country_code')
        .not('city', 'is', null)
        .order('captured_at', { ascending: false })
        .limit(500);

      if (error || !data) return;

      const countryMap: Record<string, { country_code: string | null; count: number; cities: Record<string, number> }> = {};

      data.forEach((p: any) => {
        const countryKey = p.country || p.country_code || 'Unknown';
        if (!countryMap[countryKey]) {
          countryMap[countryKey] = { country_code: p.country_code, count: 0, cities: {} };
        }
        countryMap[countryKey].count++;
        if (p.city) {
          countryMap[countryKey].cities[p.city] = (countryMap[countryKey].cities[p.city] || 0) + 1;
        }
      });

      const sorted: CountryBlock[] = Object.entries(countryMap)
        .map(([country, val]) => ({
          country,
          country_code: val.country_code,
          count: val.count,
          cities: Object.entries(val.cities)
            .map(([city, count]) => ({ city, country_code: val.country_code, count }))
            .sort((a, b) => b.count - a.count),
        }))
        .sort((a, b) => b.count - a.count);

      setCountries(sorted);
    };

    fetchCountries();
  }, []);

  // Kullanıcının reaksiyonlarını çek
  const fetchUserReactions = useCallback(async (postIds: string[]) => {
    if (!currentUserId || postIds.length === 0) return;
    const { data } = await supabase
      .from('reactions')
      .select('post_id, emoji')
      .eq('user_id', currentUserId)
      .in('post_id', postIds);
    if (data) {
      const map: Record<string, EmojiType> = {};
      data.forEach((r: any) => { map[r.post_id] = r.emoji; });
      setUserReactions(prev => ({ ...prev, ...map }));
    }
  }, [currentUserId]);

  // Postları çek
  const fetchPosts = useCallback(async (reset = false) => {
    const currentPage = reset ? 0 : page;
    if (reset) { setLoading(true); setPosts([]); setPage(0); setHasMore(true); }
    else setLoadingMore(true);

    try {
      let query = supabase
        .from('posts')
        .select('id, file_url, city, country, country_code, captured_at, reaction_heart, reaction_wow, reaction_haha, reaction_world, reaction_pray')
        .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

      // Ülke / şehir filtresi
      if (selectedCity) {
        query = query.eq('city', selectedCity);
      } else if (selectedCountry) {
        query = query.eq('country', selectedCountry);
      }

      if (filter === 'top') {
        query = query.order('reaction_heart', { ascending: false });
      } else if (filter === 'nearby' && userCoords) {
        const { data: nearbyData } = await supabase.rpc('posts_nearby', {
          user_lat: userCoords.lat,
          user_lng: userCoords.lng,
          radius_km: 50,
          page_limit: PAGE_SIZE,
          page_offset: currentPage * PAGE_SIZE,
        });
        const result = nearbyData || [];
        if (reset) setPosts(result);
        else setPosts(prev => [...prev, ...result]);
        setHasMore(result.length === PAGE_SIZE);
        await fetchUserReactions(result.map((p: Post) => p.id));
        setPage(currentPage + 1);
        return;
      } else {
        query = query.order('captured_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      const result = data || [];
      if (reset) setPosts(result);
      else setPosts(prev => [...prev, ...result]);
      setHasMore(result.length === PAGE_SIZE);
      await fetchUserReactions(result.map((p: Post) => p.id));
      setPage(currentPage + 1);
    } catch (err) {
      console.error('Feed fetch error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter, page, userCoords, fetchUserReactions, selectedCity, selectedCountry]);

  // Seçili ülkenin şehirleri
  const selectedCountryCities = selectedCountry
    ? (countries.find(c => c.country === selectedCountry)?.cities || [])
    : [];

  // Filtre, ülke veya şehir değişince yeniden çek
  useEffect(() => {
    fetchPosts(true);
  }, [filter, selectedCity, selectedCountry]);

  // Ülke seçilince şehir seçimini sıfırla
  const handleCountrySelect = (country: string | null) => {
    setSelectedCountry(country);
    setSelectedCity(null);
  };

  // Reaksiyon ekle/kaldır
  const handleReact = async (postId: string, emoji: EmojiType) => {
    if (!currentUserId) return;
    const existing = userReactions[postId];
    if (existing === emoji) {
      await supabase.from('reactions').delete()
        .eq('post_id', postId).eq('user_id', currentUserId);
      setUserReactions(prev => { const n = { ...prev }; delete n[postId]; return n; });
    } else {
      if (existing) {
        await supabase.from('reactions').delete()
          .eq('post_id', postId).eq('user_id', currentUserId);
      }
      await supabase.from('reactions').insert({ post_id: postId, user_id: currentUserId, emoji });
      setUserReactions(prev => ({ ...prev, [postId]: emoji }));
    }
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const updated = { ...p };
      const emojiKey: Record<EmojiType, keyof Post> = {
        '❤️': 'reaction_heart', '😮': 'reaction_wow',
        '😂': 'reaction_haha', '🌍': 'reaction_world', '🙏': 'reaction_pray',
      };
      if (existing) (updated[emojiKey[existing]] as number)--;
      if (existing !== emoji) (updated[emojiKey[emoji]] as number)++;
      return updated;
    }));
  };

  const filters = [
    { id: 'all' as FilterType, label: 'All' },
    { id: 'nearby' as FilterType, label: 'Nearby' },
    { id: 'top' as FilterType, label: 'Top' },
  ];

  return (
    <div
      className="w-full flex flex-col"
      style={{ height: '100dvh' }}
    >
      {/* STICKY HEADER */}
      <div className="flex-shrink-0 px-5 pt-4 pb-2 space-y-3 bg-[var(--bg-void)]">

        {/* Baslik */}
        <div className="space-y-1">
          <h1 className="font-bebas text-4xl text-white">Right now, across earth</h1>
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-green-500"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="font-jetbrains text-xs text-[var(--text-secondary)]">
              {posts.length} moments loaded
            </span>
          </div>
        </div>

        {/* ULKE BLOKLARI */}
        {countries.length > 0 && (
          <div className="space-y-2">
            {/* Ulke satiri */}
            <div
              className="flex gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCountrySelect(null)}
                className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-2 rounded-xl border transition-all"
                style={{
                  background: selectedCountry === null ? 'rgba(0,217,255,0.12)' : 'rgba(255,255,255,0.04)',
                  borderColor: selectedCountry === null ? 'rgba(0,217,255,0.5)' : 'rgba(255,255,255,0.08)',
                  minWidth: '56px',
                }}
              >
                <span className="text-lg">🌍</span>
                <span
                  className="font-jetbrains text-[9px] uppercase tracking-wider mt-1"
                  style={{ color: selectedCountry === null ? '#00D9FF' : 'rgba(255,255,255,0.4)' }}
                >
                  All
                </span>
              </motion.button>

              {countries.map((c) => (
                <motion.button
                  key={c.country}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCountrySelect(selectedCountry === c.country ? null : c.country)}
                  className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-2 rounded-xl border transition-all"
                  style={{
                    background: selectedCountry === c.country ? 'rgba(0,217,255,0.12)' : 'rgba(255,255,255,0.04)',
                    borderColor: selectedCountry === c.country ? 'rgba(0,217,255,0.5)' : 'rgba(255,255,255,0.08)',
                    minWidth: '64px',
                  }}
                >
                  <span className="text-lg">{getFlag(c.country_code)}</span>
                  <span
                    className="font-jetbrains text-[9px] uppercase tracking-wider mt-1 text-center leading-tight"
                    style={{ color: selectedCountry === c.country ? '#00D9FF' : 'rgba(255,255,255,0.6)' }}
                  >
                    {c.country.length > 8 ? c.country.slice(0, 7) + '…' : c.country}
                  </span>
                  <span className="font-jetbrains text-[8px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {c.count}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Sehir satiri - sadece ulke seciliyse */}
            <AnimatePresence>
              {selectedCountry && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 overflow-x-auto pb-1"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {selectedCountryCities.map((city) => (
                      <motion.button
                        key={city.city}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCity(selectedCity === city.city ? null : city.city)}
                        className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-2 rounded-xl border transition-all"
                        style={{
                          background: selectedCity === city.city ? 'rgba(0,217,255,0.12)' : 'rgba(255,255,255,0.04)',
                          borderColor: selectedCity === city.city ? 'rgba(0,217,255,0.5)' : 'rgba(255,255,255,0.08)',
                          minWidth: '64px',
                        }}
                      >
                        <span
                          className="font-jetbrains text-[9px] uppercase tracking-wider text-center leading-tight"
                          style={{ color: selectedCity === city.city ? '#00D9FF' : 'rgba(255,255,255,0.6)' }}
                        >
                          {city.city.length > 8 ? city.city.slice(0, 7) + '…' : city.city}
                        </span>
                        <span className="font-jetbrains text-[8px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          {city.count}
                        </span>
                      </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Filtreler */}
        <div className="flex gap-2">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full font-jetbrains text-xs tracking-wider uppercase transition-all ${
                filter === f.id
                  ? 'bg-[var(--accent-electric)] text-[var(--bg-void)] font-bold'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Secili filtre etiketi */}
        <AnimatePresence>
          {(selectedCountry || selectedCity) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2"
            >
              <span className="font-jetbrains text-[10px] text-[var(--accent-electric)] uppercase tracking-widest">
                {selectedCity ? `Showing: ${selectedCity}` : `Showing: ${selectedCountry}`}
              </span>
              <button
                onClick={() => { setSelectedCity(null); setSelectedCountry(null); }}
                className="text-[10px] text-white/30 font-jetbrains"
              >
                ✕ clear
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* VIDEO ALANI */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="font-jetbrains text-xs text-[var(--text-ghost)] uppercase tracking-widest">Loading moments...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="font-jetbrains text-sm text-[var(--text-secondary)]">
            {selectedCity ? `No moments from ${selectedCity} yet.` : 'No moments yet.'}
          </p>
          <p className="font-jetbrains text-xs text-[var(--text-ghost)] mt-1">Be the first to capture.</p>
        </div>
      ) : (
        <div
          className="flex-1 overflow-y-scroll"
          style={{
            scrollSnapType: 'y mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: '80px', // navigation bar yüksekliği
          }}
        >
            {posts.map((post) => (
              <div
                key={post.id}
                style={{
                  scrollSnapAlign: 'start',
                  scrollSnapStop: 'always',
                  height: '100%',
                  minHeight: '100%',
                  width: '100%',
                  flexShrink: 0,
                }}
              >
                <VideoCard
                  id={post.id}
                  fileUrl={post.file_url}
                  city={post.city}
                  country={post.country}
                  countryCode={post.country_code}
                  capturedAt={post.captured_at}
                  reactionHeart={post.reaction_heart}
                  reactionWow={post.reaction_wow}
                  reactionHaha={post.reaction_haha}
                  reactionWorld={post.reaction_world}
                  reactionPray={post.reaction_pray}
                  userReaction={userReactions[post.id] || null}
                  onReact={handleReact}
                  onReport={(id) => console.log('Report:', id)}
                />
              </div>
            ))}

            {hasMore && (
              <div style={{ scrollSnapAlign: 'start', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button
                  onClick={() => fetchPosts(false)}
                  disabled={loadingMore}
                  className="px-6 py-3 border border-[var(--border-glow)] rounded-lg font-jetbrains text-sm text-[var(--accent-electric)] disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { GlobalFeed };
export default GlobalFeed;
