'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const PAGE_SIZE = 10;

const getFlag = (code: string | null) => {
  if (!code) return '🌍';
  return [...code.trim().toUpperCase()]
    .map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)))
    .join('');
};

const NAV_HEIGHT = 80;

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

  const [cities, setCities] = useState<CityBlock[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (!headerRef.current) return;
    setHeaderHeight(headerRef.current.offsetHeight);
    const observer = new ResizeObserver(() => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  const cardHeight = headerHeight > 0
    ? `calc(100dvh - ${headerHeight}px - ${NAV_HEIGHT}px)`
    : '60dvh';

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

  useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('city, country_code')
        .not('city', 'is', null)
        .order('captured_at', { ascending: false })
        .limit(200);

      if (error || !data) return;

      const map: Record<string, { country_code: string | null; count: number }> = {};
      data.forEach((p: any) => {
        if (!p.city) return;
        if (!map[p.city]) map[p.city] = { country_code: p.country_code, count: 0 };
        map[p.city].count++;
      });

      const sorted = Object.entries(map)
        .map(([city, val]) => ({ city, ...val }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

      setCities(sorted);
    };

    fetchCities();
  }, []);

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

  const fetchPosts = useCallback(async (reset = false) => {
    const currentPage = reset ? 0 : page;
    if (reset) { setLoading(true); setPosts([]); setPage(0); setHasMore(true); }
    else setLoadingMore(true);

    try {
      let query = supabase
        .from('posts')
        .select('id, file_url, city, country, country_code, captured_at, reaction_heart, reaction_wow, reaction_haha, reaction_world, reaction_pray')
        .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

      if (selectedCity) {
        query = query.eq('city', selectedCity);
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
  }, [filter, page, userCoords, fetchUserReactions, selectedCity]);

  useEffect(() => {
    fetchPosts(true);
  }, [filter, selectedCity]);

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
    <div className="w-full flex flex-col bg-[var(--bg-void)]" style={{ height: '100dvh' }}>

      {/* ─── SABİT HEADER — başlık ve sayaç kaldırıldı ─── */}
      <div
        ref={headerRef}
        className="flex-shrink-0 px-5 pt-3 pb-2 space-y-2 bg-[var(--bg-void)]"
        style={{ zIndex: 10 }}
      >
        {/* ─── ŞEHİR BLOKLARI ─── */}
        {cities.length > 0 && (
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCity(null)}
              className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-2 rounded-xl border transition-all"
              style={{
                background: selectedCity === null ? 'rgba(0,217,255,0.12)' : 'rgba(255,255,255,0.04)',
                borderColor: selectedCity === null ? 'rgba(0,217,255,0.5)' : 'rgba(255,255,255,0.08)',
                minWidth: '56px',
              }}
            >
              <span className="text-lg">🌍</span>
              <span
                className="font-jetbrains text-[9px] uppercase tracking-wider mt-1"
                style={{ color: selectedCity === null ? '#00D9FF' : 'rgba(255,255,255,0.4)' }}
              >
                All
              </span>
            </motion.button>

            {cities.map((c) => (
              <motion.button
                key={c.city}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCity(selectedCity === c.city ? null : c.city)}
                className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-2 rounded-xl border transition-all"
                style={{
                  background: selectedCity === c.city ? 'rgba(0,217,255,0.12)' : 'rgba(255,255,255,0.04)',
                  borderColor: selectedCity === c.city ? 'rgba(0,217,255,0.5)' : 'rgba(255,255,255,0.08)',
                  minWidth: '64px',
                }}
              >
                <span className="text-lg">{getFlag(c.country_code)}</span>
                <span
                  className="font-jetbrains text-[9px] uppercase tracking-wider mt-1 text-center leading-tight"
                  style={{ color: selectedCity === c.city ? '#00D9FF' : 'rgba(255,255,255,0.6)' }}
                >
                  {c.city.length > 8 ? c.city.slice(0, 7) + '…' : c.city}
                </span>
                <span className="font-jetbrains text-[8px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {c.count}
                </span>
              </motion.button>
            ))}
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

        {/* Seçili şehir etiketi */}
        <AnimatePresence>
          {selectedCity && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2"
            >
              <span className="font-jetbrains text-[10px] text-[var(--accent-electric)] uppercase tracking-widest">
                Showing: {selectedCity}
              </span>
              <button
                onClick={() => setSelectedCity(null)}
                className="text-[10px] text-white/30 font-jetbrains"
              >
                ✕ clear
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── VİDEO ALANI ─── */}
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
            overflowAnchor: 'none',
          }}
        >
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always',
                height: cardHeight,
                width: '100%',
                flexShrink: 0,
                position: 'relative',
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
            <div
              style={{
                scrollSnapAlign: 'start',
                height: cardHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
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
      )}
    </div>
  );
};

export { GlobalFeed };
export default GlobalFeed;
