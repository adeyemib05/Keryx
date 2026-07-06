'use client';

import { useState } from 'react';
import { Wallet, X, ChevronRight, CheckCircle, Copy, ExternalLink, LogOut } from 'lucide-react';

// Mock wallets for demo — in production, use wagmi/RainbowKit or similar
const WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Connect using browser extension',
    icon: (
      <svg width="28" height="28" viewBox="0 0 212 189" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M201.8 0L118.6 60.7l15.6-36.8L201.8 0z" fill="#E17726"/>
        <path d="M10.2 0l82.4 61.3-14.9-37.4L10.2 0z" fill="#E27625"/>
        <path d="M172.2 136.7l-22 33.7 47 12.9 13.5-45.8-38.5-.8z" fill="#E27625"/>
        <path d="M1.3 137.5l13.4 45.8 47-12.9-22-33.7-38.4.8z" fill="#E27625"/>
        <path d="M58.9 82.3l-13.1 19.8 46.7 2.1-1.6-50.1-32 28.2z" fill="#E27625"/>
        <path d="M153.1 82.3l-32.4-28.7-1.1 50.6 46.7-2.1-13.2-19.8z" fill="#E27625"/>
        <path d="M61.9 170.4l28.1-13.6-24.2-18.9-3.9 32.5z" fill="#E27625"/>
        <path d="M122 156.8l28.2 13.6-4-32.5-24.2 18.9z" fill="#E27625"/>
      </svg>
    ),
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Use Coinbase smart wallet',
    icon: (
      <svg width="28" height="28" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" rx="100" fill="#0052FF"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M100 175C141.421 175 175 141.421 175 100C175 58.5786 141.421 25 100 25C58.5786 25 25 58.5786 25 100C25 141.421 58.5786 175 100 175ZM86 80C82.6863 80 80 82.6863 80 86V114C80 117.314 82.6863 120 86 120H114C117.314 120 120 117.314 120 114V86C120 82.6863 117.314 80 114 80H86Z" fill="white"/>
      </svg>
    ),
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    description: 'Scan with any mobile wallet',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="28" height="28" rx="8" fill="#3B99FC"/>
        <path d="M8.27 10.57c3.17-3.1 8.31-3.1 11.48 0l.38.37a.39.39 0 010 .56l-1.3 1.27a.2.2 0 01-.28 0l-.52-.51c-2.21-2.16-5.8-2.16-8.01 0l-.56.55a.2.2 0 01-.28 0L7.88 11.1a.39.39 0 010-.56l.39-.37zm14.19 2.64l1.16 1.13a.39.39 0 010 .56l-5.22 5.1a.4.4 0 01-.56 0l-3.7-3.62a.1.1 0 00-.14 0l-3.7 3.62a.4.4 0 01-.56 0L4.5 14.9a.39.39 0 010-.56l1.16-1.13a.4.4 0 01.56 0l3.7 3.62a.1.1 0 00.14 0l3.7-3.62a.4.4 0 01.56 0l3.7 3.62a.1.1 0 00.14 0l3.7-3.62a.4.4 0 01.56 0z" fill="white"/>
      </svg>
    ),
  },
];

export default function WalletConnect() {
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<{ wallet: string; address: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = async (walletId: string) => {
    setConnecting(walletId);
    // Simulate connection delay
    await new Promise(r => setTimeout(r, 1500));
    setConnected({ wallet: walletId, address: '0xde31...970E' });
    setConnecting(null);
    setOpen(false);
  };

  const handleDisconnect = () => {
    setConnected(null);
    setShowDropdown(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('0xde31a25CE2420313D95E8fec237E6a3F9f11970e');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (connected) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(d => !d)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/5"
          style={{ background: 'rgba(68,136,255,0.1)', border: '1px solid rgba(68,136,255,0.25)', color: '#4488ff' }}
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-xs hidden sm:inline">{connected.address}</span>
          <ChevronRight size={14} className={`transition-transform duration-200 ${showDropdown ? 'rotate-90' : ''}`} />
        </button>

        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <div
              className="absolute right-0 top-12 w-56 rounded-2xl p-2 z-50"
              style={{ background: 'rgba(10,10,18,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
            >
              <div className="px-3 py-2 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>Connected via {connected.wallet}</p>
                <p className="text-sm font-mono mt-1 text-white">0xde31...970E</p>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm transition-all hover:bg-white/5"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                {copied ? <CheckCircle size={15} className="text-green-400" /> : <Copy size={15} />}
                {copied ? 'Copied!' : 'Copy Address'}
              </button>

              <a
                href="https://testnet.arc.network/address/0xde31a25CE2420313D95E8fec237E6a3F9f11970e"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm transition-all hover:bg-white/5"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                <ExternalLink size={15} />
                View on Arc Explorer
              </a>

              <button
                onClick={handleDisconnect}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm transition-all hover:bg-red-500/10 mt-1"
                style={{ color: '#f87171', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4px', paddingTop: '8px' }}
              >
                <LogOut size={15} />
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #4488ff, #9d4edd)', color: '#fff', boxShadow: '0 4px 20px rgba(68,136,255,0.3)' }}
      >
        <Wallet size={15} />
        <span className="hidden sm:inline">Connect Wallet</span>
      </button>

      {/* Modal Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 relative"
            style={{ background: 'rgba(10, 10, 20, 0.95)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 80px rgba(0,0,0,0.8)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-space, system-ui)' }}>Connect Wallet</h2>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Choose your preferred provider</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Wallet Options */}
            <div className="flex flex-col gap-2">
              {WALLETS.map(w => (
                <button
                  key={w.id}
                  onClick={() => handleConnect(w.name)}
                  disabled={!!connecting}
                  className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: connecting === w.name ? 'rgba(68,136,255,0.1)' : 'rgba(255,255,255,0.04)',
                    border: connecting === w.name ? '1px solid rgba(68,136,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  }}
                  onMouseEnter={e => { if (!connecting) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { if (!connecting) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {w.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white">{w.name}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{w.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {connecting === w.name ? (
                      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'rgba(68,136,255,0.3)', borderTopColor: '#4488ff' }} />
                    ) : (
                      <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <p className="text-center text-xs mt-5" style={{ color: 'rgba(255,255,255,0.25)' }}>
              By connecting, you agree to the Terms of Service
            </p>
          </div>
        </div>
      )}
    </>
  );
}
