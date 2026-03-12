'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingFlowProps {
  onComplete?: () => void;
  initialStep?: number;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, initialStep = 0 }) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const steps = [
    {
      title: 'The Problem',
      description: 'Social media lied to you',
      icon: '❌',
      content: (
        <div className="flex justify-center gap-8 mb-8">
          {['📱', '📸', '✂️'].map((emoji, i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className="text-5xl opacity-50"
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      title: 'The Moment',
      description: '3 seconds. No second chances.',
      icon: '⏱️',
      content: (
        <div className="flex flex-col items-center gap-4 mb-8">
          <motion.div
            animate={{ scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="font-bebas text-7xl text-[var(--accent-electric)]"
          >
            3
          </motion.div>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[var(--accent-electric)] to-transparent rounded-full" />
        </div>
      ),
    },
    {
      title: 'The World',
      description: '47 countries. Right now.',
      icon: '🌍',
      content: (
        <div className="flex flex-col items-center gap-4 mb-8">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl">
            🌍
          </motion.div>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[var(--accent-electric)]"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'The People',
      description: 'Real humans. Real moments.',
      icon: '❤️',
      content: (
        <div className="flex flex-col items-center gap-4 mb-8">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl">
            ❤️
          </motion.div>
          <div className="flex gap-3">
            {['❤️', '😮', '😂', '🌍', '🙏'].map((emoji, i) => (
              <motion.div
                key={i}
                className="text-3xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
              >
                {emoji}
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  const step = steps[currentStep];

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-[var(--bg-void)] via-[var(--bg-deep)] to-[var(--bg-void)] flex flex-col items-center justify-center p-6 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 font-jetbrains text-xs tracking-widest text-[var(--text-ghost)] uppercase"
      >
        Skip
      </button>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center max-w-md text-center"
      >
        <div className="text-7xl mb-8">{step.icon}</div>
        {step.content}
        <h2 className="font-bebas text-5xl text-white mb-2">{step.title}</h2>
        <p className="font-dm-sans text-lg text-[var(--text-secondary)] mb-12">{step.description}</p>

        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-2 rounded-full transition-all ${i === currentStep ? 'w-8 bg-[var(--accent-electric)]' : 'w-2 bg-[var(--border-subtle)]'}`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>

        <motion.button
          onClick={() => currentStep < steps.length - 1 ? setCurrentStep(currentStep + 1) : onComplete?.()}
          className="px-8 py-3 bg-gradient-to-r from-[var(--accent-electric)] to-[var(--accent-pulse)] text-white rounded-lg font-jetbrains font-bold tracking-wider uppercase"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export { OnboardingFlow };
export default OnboardingFlow;
