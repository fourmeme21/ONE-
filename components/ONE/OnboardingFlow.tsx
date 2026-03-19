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
      description: 'Social media lied to you. ONE doesn\'t.',
      icon: '❌',
      content: (
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex justify-center gap-8">
            {['📱', '📸', '✂️'].map((emoji, i) => (
              <motion.div key={i} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} className="text-5xl opacity-40">{emoji}</motion.div>
            ))}
          </div>
          <p className="font-dm-sans text-sm text-white/50 text-center">Filters. Edits. Performances. Lies.</p>
        </div>
      ),
    },
    {
      title: 'The Window',
      description: 'Every day, a random window opens.',
      icon: '🌊',
      content: (
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-full rounded-2xl p-4 space-y-3" style={{ background: 'rgba(0,217,255,0.08)', border: '1px solid rgba(0,217,255,0.2)' }}>
            {[
              { label: '🌅 Morning Wave', time: '06:00 – 08:00', color: '#FFB347' },
              { label: '☀️ Midday Wave', time: '12:00 – 14:00', color: '#00D9FF' },
              { label: '🌆 Evening Wave', time: '20:00 – 22:00', color: '#C084FC' },
            ].map((wave, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex items-center justify-between px-3 py-2 rounded-xl"
                style={{ background: `${wave.color}15`, border: `1px solid ${wave.color}40` }}
              >
                <span className="font-jetbrains text-xs font-bold" style={{ color: wave.color }}>{wave.label}</span>
                <span className="font-jetbrains text-[10px] text-white/40">{wave.time}</span>
              </motion.div>
            ))}
          </div>
          <p className="font-dm-sans text-xs text-white/50 text-center">One random wave per day. 2 hours only.</p>
        </div>
      ),
    },
    {
      title: 'The Rules',
      description: 'One shot. No second chances.',
      icon: '⏱️',
      content: (
        <div className="flex flex-col items-center gap-3 mb-8 w-full">
          {[
            { icon: '🎯', rule: 'One capture per wave', sub: 'Miss it? Wait for tomorrow.' },
            { icon: '🚫', rule: 'No filters. No gallery.', sub: 'Live camera only.' },
            { icon: '⏱️', rule: '3 to 30 seconds', sub: 'Raw and real.' },
            { icon: '👻', rule: 'Anonymous by default', sub: 'Only your city is shown.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-jetbrains text-xs text-white font-bold">{item.rule}</p>
                <p className="font-jetbrains text-[10px] text-white/40">{item.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      title: 'The World',
      description: 'Humanity. Right now. Unfiltered.',
      icon: '🌍',
      content: (
        <div className="flex flex-col items-center gap-4 mb-8">
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-8xl">🌍</motion.div>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div key={i} className="w-2 h-2 rounded-full bg-[var(--accent-electric)]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} />
            ))}
          </div>
          <p className="font-dm-sans text-sm text-white/60 text-center">Every captured moment becomes part of your annual documentary.</p>
        </div>
      ),
    },
  ];

  const step = steps[currentStep];

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center p-6 z-50"
      style={{ background: '#05070F' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button onClick={onComplete} className="absolute top-6 right-6 font-jetbrains text-xs tracking-widest text-white/30 uppercase">Skip</button>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center max-w-md text-center w-full"
        >
          <div className="text-6xl mb-4">{step.icon}</div>
          {step.content}
          <h2 className="font-bebas text-4xl text-white mb-1">{step.title}</h2>
          <p className="font-dm-sans text-sm text-white/60 mb-8">{step.description}</p>

          <div className="flex gap-2 mb-6">
            {steps.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-1.5 rounded-full transition-all ${i === currentStep ? 'w-8 bg-[var(--accent-electric)]' : 'w-2 bg-white/20'}`}
              />
            ))}
          </div>

          <motion.button
            onClick={() => currentStep < steps.length - 1 ? setCurrentStep(currentStep + 1) : onComplete?.()}
            className="w-full py-4 rounded-2xl font-bebas text-2xl tracking-widest text-white"
            style={{ background: 'linear-gradient(135deg, #00D9FF 0%, #7C3AED 100%)', boxShadow: '0 0 30px rgba(0,217,255,0.2)' }}
            whileTap={{ scale: 0.97 }}
          >
            {currentStep === steps.length - 1 ? 'ENTER REALITY' : 'NEXT'}
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export { OnboardingFlow };
export default OnboardingFlow;
