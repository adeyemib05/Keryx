'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  MessageSquare,
  BarChart2,
  BookOpen,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Zap,
  Globe,
} from 'lucide-react';

const navItems = [
  { label: 'Agent', href: '/', icon: MessageSquare, accent: '#4488ff' },
  { label: 'Dashboard', href: '/dashboard', icon: BarChart2, accent: '#ff4488' },
  { label: 'Explorer', href: '/explorer', icon: Globe, accent: '#00ff88' },
  { label: 'Publishers', href: '/publishers', icon: Globe, accent: '#9d4edd' },
  { label: 'Register', href: '/register', icon: BookOpen, accent: '#f59e0b' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="relative flex flex-col transition-all duration-300 ease-in-out flex-shrink-0"
      style={{
        width: collapsed ? '72px' : '220px',
        background: 'rgba(8, 8, 14, 0.95)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 overflow-hidden"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex-shrink-0" style={{ position: 'relative' }}>
          <svg width="32" height="32" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
            <style>{`
              @keyframes keryxDraw { 0% { stroke-dashoffset: 200; } 100% { stroke-dashoffset: 0; } }
              @keyframes keryxGlow {
                0%, 100% { opacity: 0.5; filter: drop-shadow(0 0 3px rgba(68,136,255,0.5)); }
                50% { opacity: 1; filter: drop-shadow(0 0 12px rgba(68,136,255,1)); }
              }
              .s-wave { stroke-dasharray: 200; animation: keryxDraw 3s ease-in-out infinite alternate; }
              .s-dot { animation: keryxGlow 2s ease-in-out infinite; }
            `}</style>
            <circle cx="48" cy="48" r="44" fill="none" stroke="#4488ff" strokeWidth="2" opacity="0.2"/>
            <circle cx="48" cy="48" r="32" fill="#4488ff08" stroke="#4488ff" strokeWidth="1.5"/>
            <polyline className="s-wave" points="4,48 20,48 30,26 44,70 56,32 66,48 92,48" fill="none" stroke="#4488ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <circle className="s-dot" cx="44" cy="70" r="5" fill="#4488ff"/>
            <circle className="s-dot" cx="44" cy="70" r="9" fill="none" stroke="#4488ff" strokeWidth="1.5" opacity="0.4"/>
          </svg>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-lg leading-none tracking-tight" style={{ fontFamily: 'var(--font-space, system-ui)', color: '#fff' }}>Keryx</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Pay-per-citation</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map(({ label, href, icon: Icon, accent }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className="flex items-center gap-3 rounded-xl transition-all duration-200 overflow-hidden"
              style={{
                padding: collapsed ? '10px 12px' : '10px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? `${accent}18` : 'transparent',
                border: active ? `1px solid ${accent}30` : '1px solid transparent',
                color: active ? accent : 'rgba(255,255,255,0.55)',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLElement).style.color = '#fff';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)';
                }
              }}
            >
              <Icon size={18} style={{ flexShrink: 0, color: active ? accent : 'inherit' }} />
              {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
              {active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Arc Network Status */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 rounded-xl" style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
            <span className="text-xs font-semibold" style={{ color: '#00ff88' }}>Arc Testnet</span>
          </div>
          <a
            href="https://testnet.arc.network"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-80"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            <ExternalLink size={11} />
            Block Explorer
          </a>
        </div>
      )}

      {/* Network badge when collapsed */}
      {collapsed && (
        <div className="flex justify-center mb-3">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="Arc Testnet: Connected" />
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center z-20 transition-all duration-200 hover:scale-110"
        style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Bottom Powered by */}
      {!collapsed && (
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Zap size={11} style={{ color: 'rgba(255,255,255,0.25)' }} />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Powered by Circle x402</p>
        </div>
      )}
    </aside>
  );
}
