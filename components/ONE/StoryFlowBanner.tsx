`components/ONE/StoryFlowBanner.tsx`

```tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

const stories = [
  {
    title: 'Instagram with X',
    subtitle: 'Filtered reality ends here',
    icon: '❌',
    gradient: 'linear-gradient(135deg, #D97706, #B45309)',
  },
  {
    title: '3 Seconds',
    subtitle: 'No second chances.',
    icon: '⏱️',
    gradient: 'linear-gradient(135deg, #0EA5E9, #2563EB)',
  },
  {
    title: '47 Countries',
    subtitle: 'Right now.',
    icon: '🌍',
    gradient: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
  },
  {
    title: 'Real Humans',
    subtitle: 'Real moments.',
    icon: '❤️',
    gradient: 'linear-gradient(135deg, #EC4899, #BE185D)',
  },
];

const StoryFlowBanner: React.FC = () => {
  return (
    <div className="w-full space-y-5">
      <h2
        className="font-bebas text-3xl text-white"
        style={{ letterSpacing: '0.05em' }}
      >
        The ONE Story
      </h2>

      <div
        className="flex gap-3 overflow-x-auto pb-3"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {stories.map((story, index) => (
          <React.Fragment key={index}>
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex-shrink-0 rounded-2xl flex flex-col items-center justify-center text-center p-4 relative overflow-hidden"
              style={{
                width: '140px',
                height: '180px',
                background: story.gradient,
              }}
            >
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10 flex flex-col items-center gap-2">
                <span style={{ fontSize: '32px' }}>{story.icon}</span>
                <p className="font-bebas text-white text-lg leading-tight">{story.title}</p>
                <p className="font-jetbrains text-white/70 text-[10px] leading-snug">{story.subtitle}</p>
              </div>
            </motion.div>

            {index < stories.length - 1 && (
              <div className="flex-shrink-0 flex items-center text-[var(--text-ghost)] text-lg self-center">
                →
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Countries', value: '47' },
          { label: 'Cities', value: '891' },
          { label: 'Moments', value: '2,847' },
          { label: 'Active Today', value: 'Live' },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center"
          >
            <div className="font-bebas text-2xl text-[var(--accent-electric)]">{stat.value}</div>
            <div className="font-jetbrains text-[10px] text-[var(--text-ghost)] uppercase tracking-wider mt-0.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { StoryFlowBanner };
export default StoryFlowBanner;
```
