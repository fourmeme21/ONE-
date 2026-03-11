```ts
import { Variants } from 'framer-motion';

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i?: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
      delay: typeof i === 'number' ? i * 0.1 : 0,
    },
  }),
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i?: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
      delay: typeof i === 'number' ? i * 0.08 : 0,
    },
  }),
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export const countdownPulse: Variants = {
  animate: {
    scale: [1, 1.1, 1],
    color: ['#FFD60A', '#7C3AED', '#00D9FF'],
    transition: {
      duration: 1,
      ease: 'easeInOut',
      times: [0, 0.5, 1],
    },
  },
};

export const reactionFloat: Variants = {
  animate: {
    y: -100,
    opacity: [1, 0],
    transition: {
      duration: 1.2,
      ease: 'easeOut',
    },
  },
};

export const glowPulse: Variants = {
  animate: {
    boxShadow: [
      '0 0 20px var(--accent-electric)',
      '0 0 40px var(--accent-electric)',
      '0 0 20px var(--accent-electric)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

export const slideDownNotification: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
  exit: {
    y: -100,
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export const breathe: Variants = {
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const scanLine: Variants = {
  animate: {
    top: ['0%', '100%'],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const shimmer: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};
```
