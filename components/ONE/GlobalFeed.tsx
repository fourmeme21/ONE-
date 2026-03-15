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

const PAGE_SIZE = 10;

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

  // Kullanıcı bilgisi
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
    // IP'den konum al
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => {
        if (d.latitude && d.longitude) {
          setUserCoords({ lat: d.latitude, lng: d.longitude });
        }
      })
      .catch(() => {});
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

      if (filter === 'top') {
        // Top: toplam reaksiyon sayısına göre sırala
        query = query.order('reaction_heart', { ascending: false });
      } else if (filter === 'nearby' && userCoords) {
        // Nearby: PostGIS ile 50km radius
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
  }, [filter, page, userCoords, fetchUserReactions]);

  // Filtre değişince yeniden çek
  useEffect(() => {
    fetchPosts(true);
  }, [filter]);

  // Reaksiyon ekle/kaldır
  const handleReact = async (postId: string, emoji: EmojiType) => {
    if (!currentUserId) return;

    const existing = userReactions[postId];

    if (existing === emoji) {
      // Aynı emojiye basıldı — kaldır
      await supabase.from('reactions').delete()
        .eq('post_id', postId).eq('user_id', currentUserId);
      setUserReactions(prev => { const n = { ...prev }; delete n[postId]; return n; });
    } else {
      // Yeni reaksiyon — önce eskiyi sil, sonra ekle
      if (existing) {
        await supabase.from('reactions').delete()
          .eq('post_id', postId).eq('user_id', currentUserId);
      }
      await supabase.from('reactions').insert({ post_id: postId, user_id: currentUserId, emoji });
      setUserReactions(prev => ({ ...prev, [postId]: emoji }));
    }

    // Reaksiyon sayılarını güncelle
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
    <div className="w-full space-y-4">
      {/* Başlık */}
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

      {/* İçerik */}
      {loading ? (
        <div className="py-16 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="font-jetbrains text-xs text-[var(--text-ghost)] uppercase tracking-widest">Loading moments...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-jetbrains text-sm text-[var(--text-secondary)]">No moments yet.</p>
          <p className="font-jetbrains text-xs text-[var(--text-ghost)] mt-1">Be the first to capture.</p>
        </div>
      ) : (
        <>
          {/* TikTok snap scroll container */}
          <div
            style={{
              height: '100dvh',
              overflowY: 'scroll',
              scrollSnapType: 'y mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
            }}
          >
            {posts.map((post) => (
              <div
                key={post.id}
                style={{
                  scrollSnapAlign: 'start',
                  scrollSnapStop: 'always',
                  height: '100dvh',
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

            {/* Load more trigger */}
            {hasMore && (
              <div
                style={{ scrollSnapAlign: 'start', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
        </>
      )}
    </div>
  );
};

export { GlobalFeed };
export default GlobalFeed;
