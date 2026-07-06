'use client';

import { useState, useEffect } from 'react';
import {
  ExternalLink, TrendingUp, DollarSign, BookOpen, Users, Zap, RefreshCw, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

interface Payment {
  id: string;
  article_title?: string;
  publisher_name?: string;
  amount_usdc: number;
  arc_tx_hash?: string;
  payer_address?: string;
  created_at: string;
}

export default function ExplorerPage() {
  const [stats, setStats] = useState<any>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
      setPayments(data.recent_payments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  };

  useEffect(() => { fetchData(); }, []);

  const formatAddr = (addr?: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '—';
  const formatHash = (hash?: string) => hash ? `${hash.slice(0, 8)}...${hash.slice(-4)}` : '—';
  const isOnChain = (hash?: string) => hash && hash !== 'settlement_failed' && hash !== 'demo_pending' && hash.length > 10;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-space, system-ui)' }}>Transaction Explorer</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Live on-chain citation payments · Arc Testnet
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all hover:bg-white/5 disabled:opacity-50"
          style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Paid (USDC)',
            value: `$${(stats?.total_paid_usdc || 0).toFixed(4)}`,
            icon: DollarSign,
            color: '#00ff88',
            bg: 'rgba(0,255,136,0.08)',
            border: 'rgba(0,255,136,0.15)',
          },
          {
            label: 'Total Citations',
            value: stats?.total_citations || 0,
            icon: Zap,
            color: '#4488ff',
            bg: 'rgba(68,136,255,0.08)',
            border: 'rgba(68,136,255,0.15)',
          },
          {
            label: 'Publishers',
            value: stats?.total_publishers || 0,
            icon: Users,
            color: '#9d4edd',
            bg: 'rgba(157,78,221,0.08)',
            border: 'rgba(157,78,221,0.15)',
          },
          {
            label: 'Articles Indexed',
            value: stats?.total_articles || 0,
            icon: BookOpen,
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.08)',
            border: 'rgba(245,158,11,0.15)',
          },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-2xl p-5"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon size={18} style={{ color: s.color }} />
                <TrendingUp size={13} style={{ color: 'rgba(255,255,255,0.2)' }} />
              </div>
              <p
                className="text-2xl font-bold mb-1"
                style={{ color: s.color, fontFamily: 'var(--font-space, system-ui)' }}
              >
                {loading ? (
                  <span className="inline-block w-16 h-6 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
                ) : s.value}
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Arc Explorer CTA */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl p-5 mb-8"
        style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)' }}
      >
        <div>
          <p className="font-semibold mb-1" style={{ color: '#00ff88' }}>🔗 Arc Testnet Block Explorer</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Verify every payment transaction independently on the Arc blockchain.
          </p>
        </div>
        <a
          href="https://testnet.arc.network"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all hover:scale-105"
          style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)' }}
        >
          Open Explorer <ArrowUpRight size={15} />
        </a>
      </div>

      {/* Recent Transactions Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="font-semibold text-sm">Recent Citation Payments</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {loading ? (
          <div className="p-8 flex flex-col gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <Zap size={32} style={{ color: 'rgba(255,255,255,0.1)' }} className="mx-auto mb-4" />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>No transactions yet</p>
            <p className="text-xs mt-1 mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Use the agent to trigger your first citation payment
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{ background: 'rgba(68,136,255,0.12)', color: '#4488ff', border: '1px solid rgba(68,136,255,0.2)' }}
            >
              Try the Agent →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Article', 'Publisher', 'Amount', 'Tx Hash', 'Payer', 'Status'].map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => {
                  const onChain = isOnChain(p.arc_tx_hash);
                  return (
                    <tr
                      key={p.id || i}
                      className="transition-all hover:bg-white/2"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td className="px-4 py-3 max-w-xs">
                        <p className="truncate text-xs font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
                          {p.article_title || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          {p.publisher_name || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-bold font-mono px-2 py-1 rounded-lg"
                          style={{ background: 'rgba(0,255,136,0.08)', color: '#00ff88' }}
                        >
                          ${(p.amount_usdc || 0).toFixed(4)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {onChain ? (
                          <a
                            href={`https://testnet.arc.network/tx/${p.arc_tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 font-mono text-xs hover:opacity-70 transition-opacity"
                            style={{ color: '#4488ff' }}
                          >
                            {formatHash(p.arc_tx_hash)}
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            {p.arc_tx_hash || '—'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {formatAddr(p.payer_address)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {onChain ? (
                          <span className="flex items-center gap-1 text-xs" style={{ color: '#00ff88' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            Settled
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                            Demo
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Keryx · Built on Arc · Powered by Circle x402 · Pay-per-citation micropayments
      </p>
    </div>
  );
}
