'use client';

import { useState } from 'react';
import { Bell, HelpCircle, Wifi, Menu } from 'lucide-react';
import WalletConnect from './WalletConnect';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

export default function Header({ title = 'Agent Playground', subtitle = 'Ask a question. Pay per citation.', onMenuToggle }: HeaderProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <header
      className="flex items-center justify-between px-4 sm:px-6 py-4 flex-shrink-0"
      style={{
        background: 'rgba(8, 8, 14, 0.7)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Mobile hamburger — only visible on small screens */}
        <button
          onClick={onMenuToggle}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-white/5 flex-shrink-0"
          style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Left: Page title */}
        <div>
          <h1
            className="text-base sm:text-lg font-bold leading-tight tracking-tight"
            style={{ fontFamily: 'var(--font-space, system-ui)', color: '#fff' }}
          >
            {title}
          </h1>
          <p className="text-xs mt-0.5 hidden sm:block" style={{ color: 'rgba(255,255,255,0.35)' }}>{subtitle}</p>
        </div>
      </div>

      {/* Right: Status + Actions + Wallet */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live network badge */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', color: '#00ff88' }}
        >
          <Wifi size={11} />
          Arc Testnet
        </div>

        {/* USDC indicator */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: 'rgba(39,117,202,0.12)', border: '1px solid rgba(39,117,202,0.25)', color: '#5ba4f5' }}
        >
          <span className="font-mono">USDC</span>
          <span className="opacity-60">·</span>
          <span className="font-bold">0.100</span>
        </div>

        {/* Notification bell */}
        <button
          className="w-9 h-9 rounded-xl hidden sm:flex items-center justify-center transition-all duration-200 hover:bg-white/5"
          style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
          title="Notifications"
        >
          <Bell size={16} />
        </button>

        {/* Help button */}
        <button
          onClick={() => setShowHelp(true)}
          className="w-9 h-9 rounded-xl hidden sm:flex items-center justify-center transition-all duration-200 hover:bg-white/5"
          style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
          title="Help / Onboarding"
        >
          <HelpCircle size={16} />
        </button>

        {/* Wallet Connect */}
        <WalletConnect />
      </div>
    </header>
  );
}
