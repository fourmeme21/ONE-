'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface Post {
  id: string;
  file_url: string;
  city: string | null;
  country: string | null;
  country_code: string | null;
  captured_at: string;
}

const PAGE_SIZE = 30;

const TimeArchive: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const countries = new Set(posts.map(p => p.country_code).filter(Boolean)).size;
  const year = new Date().getFullYear();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Check premium status
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();
      if (profile?.is_premium) setIsPremium(true);

      // Fetch first page
      const { data, error } = await supabase
        .from('posts')
        .select('id, file_url, city, country, country_code, captured_at')
        .eq('user_id', user.id)
        .order('captured_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (!error && data) {
        setPosts(data);
        setHasMore(data.length === PAGE_SIZE);
        setPage(1);
      }
      setLoading(false);
    };
    init();
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoadingMore(false); return; }

    const { data, error } = await supabase
      .from('posts')
      .select('id, file_url, city, country, country_code, captured_at')
      .eq('user_id', user.id)
      .order('captured_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (!error && data) {
      setPosts(prev => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
      setPage(p => p + 1);
    }
    setLoadingMore(false);
  };

  const handleGenerateVideo = () => {
    setIsGeneratingVideo(true);
    setTimeout(() => setIsGeneratingVideo(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="font-jetbrains text-xs text-[var(--text-ghost)] uppercase tracking-widest">Loading your moments...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
        <span className="text-5xl">📭</span>
        <p className="font-bebas text-2xl text-white">No moments yet</p>
        <p className="font-jetbrains text-xs text-[var(--text-secondary)] text-center uppercase tracking-widest">
          Capture your first moment to start your archive
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full space-y-6 px-4 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="space-y-1 pt-4">
        <h1 className="font-bebas text-5xl text-white">Your Archive</h1>
        <p className="font-jetbrains text-xs tracking-widest text-[var(--text-secondary)] uppercase">
          {posts.length} moments · {countries} {countries === 1 ? 'country' : 'countries'} · {year}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
            className="aspect-square rounded-lg overflow-hidden bg-[var(--bg-surface)] relative"
          >
            {post.file_url ? (
              <video
                src={post.file_url}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs font-jetbrains text-white/30">{index + 1}</span>
              </div>
            )}
            {post.city && (
              <div className="absolute bottom-0 left-0 right-0 px-1 pb-1 pt-3 bg-gradient-to-t from-black/70 to-transparent">
                <p className="font-jetbrains text-[8px] text-white/70 truncate uppercase tracking-wider">
                  {post.city}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full px-6 py-3 border border-[var(--border-glow)] rounded-lg font-jetbrains text-sm text-[var(--accent-electric)] disabled:opacity-50"
        >
          {loadingMore ? 'Loading...' : 'Load more'}
        </button>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <motion.button
          onClick={handleGenerateVideo}
          disabled={isGeneratingVideo}
          className="w-full px-6 py-4 rounded-lg font-jetbrains text-sm font-bold tracking-wider uppercase bg-[var(--bg-surface)] text-white disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isGeneratingVideo ? 'Generating...' : 'Generate My Year Video'}
        </motion.button>

        {!isPremium && (
          <motion.button
            className="w-full px-6 py-4 rounded-lg font-jetbrains text-sm font-bold tracking-wider uppercase bg-gradient-to-r from-[var(--accent-electric)] to-[var(--accent-pulse)] text-[var(--bg-void)]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Get ONE Premium — $9/month
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export { TimeArchive };
export default TimeArchive;
