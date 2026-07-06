'use client';

import { useState, useEffect } from 'react';
import { X, Zap, Shield, BarChart2, ChevronRight, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    icon: Zap,
    color: '#4488ff',
    title: 'Ask the Agent',
    description: 'Type any question. The Keryx AI agent reads relevant news and articles to build an informed, cited answer.',
    detail: 'No hallucinations — every claim is backed by a real, paid source.',
  },
  {
    icon: Shield,
    color: '#00ff88',
    title: 'Pay-Per-Citation (x402)',
    description: 'Before the agent reads an article in full, it pays the publisher a tiny micropayment in USDC — instantly, on-chain.',
    detail: 'Powered by Circle\'s x402 protocol on Arc Network. Gasless, near-instant, and fully verifiable.',
  },
  {
    icon: BarChart2,
    color: '#9d4edd',
    title: 'Verifiable Receipts',
    description: 'Every payment generates a cryptographic citation receipt with an on-chain Arc transaction hash.',
    detail: 'Publishers can verify exactly who cited their work, when, and how much they received.',
  },
];

const WELCOME_KEY = 'keryx_welcome_seen';

export default function WelcomeGuide() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Only show on first visit
    if (typeof window !== 'undefined' && !localStorage.getItem(WELCOME_KEY)) {
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(WELCOME_KEY, '1');
    setOpen(false);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      handleDismiss();
    }
  };

  if (!open) return null;

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden relative"
        style={{
          background: 'rgba(10, 10, 20, 0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: `0 0 0 1px rgba(255,255,255,0.05), 0 40px 100px rgba(0,0,0,0.8), 0 0 80px ${current.color}15`,
        }}
      >
        {/* Top gradient bar */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${current.color}, ${current.color}80)` }} />

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10 z-10"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <X size={16} />
        </button>

        <div className="p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: i === step ? '28px' : '8px',
                  background: i === step ? current.color : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>

          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500"
            style={{ background: `${current.color}18`, border: `1px solid ${current.color}30` }}
          >
            <Icon size={28} style={{ color: current.color }} />
          </div>

          {/* Content */}
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: current.color }}>
            Step {step + 1} of {STEPS.length}
          </p>
          <h2
            className="text-2xl font-bold mb-3 leading-tight"
            style={{ fontFamily: 'var(--font-space, system-ui)' }}
          >
            {current.title}
          </h2>
          <p className="text-base mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {current.description}
          </p>
          <p
            className="text-sm p-3 rounded-xl leading-relaxed"
            style={{ background: `${current.color}08`, border: `1px solid ${current.color}20`, color: 'rgba(255,255,255,0.45)' }}
          >
            💡 {current.detail}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleDismiss}
              className="text-sm transition-opacity hover:opacity-60"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Skip tour
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: `linear-gradient(135deg, ${current.color}, ${current.color}bb)`, color: '#000' }}
            >
              {step < STEPS.length - 1 ? (
                <>Next <ChevronRight size={15} /></>
              ) : (
                <>Get Started <ArrowRight size={15} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
