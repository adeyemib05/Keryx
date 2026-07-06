'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  BookOpen,
  Zap,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Search,
  Wallet
} from 'lucide-react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [inputSlug, setInputSlug] = useState('');

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    fetch(`/api/publishers/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Publisher not found');
        return res.json();
      })
      .then(d => setData(d))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (!slug) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-screen">
        <div 
          className="w-full max-w-md rounded-3xl p-8 relative overflow-hidden text-center"
          style={{ 
            background: 'rgba(15, 15, 20, 0.6)', 
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Subtle glow behind */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
          
          <Wallet size={48} className="mx-auto mb-6 text-blue-400 opacity-80" />
          
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-space, system-ui)' }}>
            Publisher Dashboard
          </h2>
          <p className="mb-8 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Enter your publication slug to view your live earnings and citation metrics.
          </p>
          
          <div className="flex flex-col gap-3">
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-4 text-gray-400" />
              <input
                className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all focus:border-blue-500/50"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  color: '#fff' 
                }}
                placeholder="e.g. techcrunch"
                value={inputSlug}
                onChange={e => setInputSlug(e.target.value.toLowerCase())}
                onKeyDown={e => {
                  if (e.key === 'Enter' && inputSlug) {
                    window.location.href = `/dashboard?slug=${inputSlug}`;
                  }
                }}
              />
            </div>
            <button
              onClick={() => { if (inputSlug) window.location.href = `/dashboard?slug=${inputSlug}`; }}
              disabled={!inputSlug}
              className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #4488ff, #9d4edd)', color: '#fff' }}
            >
              Access Dashboard <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-xs text-gray-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-4" style={{ borderColor: 'rgba(68,136,255,0.3)', borderTopColor: '#4488ff' }} />
      <p style={{ color: 'var(--color-text-secondary)' }}>Loading dashboard metrics...</p>
    </div>
  );

  if (error) return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <ShieldAlert size={48} className="text-red-400/80 mb-6" />
      <h2 className="text-xl font-bold mb-2">Access Denied</h2>
      <p className="text-red-400 mb-8 max-w-sm mx-auto">{error}</p>
      <Link 
        href="/register" 
        className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 bg-white/5 border border-white/10 hover:bg-white/10"
      >
        Register Publication
      </Link>
    </div>
  );

  if (!data) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-blue-400 font-bold uppercase">
              {data.publisher.name.charAt(0)}
            </div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-space, system-ui)' }}>
              {data.publisher.name}
            </h1>
          </div>
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live Dashboard & Earnings
          </p>
        </div>
        <Link
          href={`/publishers/${slug}`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all hover:bg-white/5"
          style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
        >
          Public Profile <ExternalLink size={14} />
        </Link>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={64} className="text-green-400" />
          </div>
          <p className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>Total Earned</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold font-mono text-green-400">
              ${Number(data.stats.total_earned_usdc || 0).toFixed(4)}
            </span>
            <span className="text-sm text-green-400/50 mb-1">USDC</span>
          </div>
        </div>

        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={64} className="text-blue-400" />
          </div>
          <p className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>Citations Received</p>
          <span className="text-4xl font-bold font-mono text-blue-400">
            {data.stats.citation_count}
          </span>
        </div>

        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen size={64} className="text-purple-400" />
          </div>
          <p className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>Indexed Articles</p>
          <span className="text-4xl font-bold font-mono text-purple-400">
            {data.stats.article_count}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Wallet Info */}
        <div className="lg:col-span-1 glass-panel p-6 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Settlement Wallet</h3>
          </div>
          
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 mb-4">
            <p className="text-xs font-mono break-all text-gray-300 leading-relaxed">
              {data.publisher.wallet_address}
            </p>
          </div>
          
          <a
            href={`https://testnet.arcscan.app/address/${data.publisher.wallet_address}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-blue-500/10 text-blue-400 border border-blue-500/20"
          >
            Verify on Arc Explorer <ExternalLink size={14} />
          </a>
        </div>

        {/* Recent Citations List */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-space, system-ui)' }}>Recent Citations</h2>
            <TrendingUp size={16} className="text-gray-400" />
          </div>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {data.recent_payments && data.recent_payments.length > 0 ? (
              data.recent_payments.map((payment: any, i: number) => (
                <div key={payment.id || i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-medium text-gray-200 truncate">{payment.article_title || 'Unknown Article'}</p>
                    <a 
                      href={`https://testnet.arcscan.app/tx/${payment.arc_tx_hash}`} 
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-gray-500 hover:text-blue-400 truncate flex items-center gap-1 mt-1"
                    >
                      Tx: {payment.arc_tx_hash ? `${payment.arc_tx_hash.slice(0, 10)}...${payment.arc_tx_hash.slice(-6)}` : 'Pending'}
                      <ExternalLink size={10} />
                    </a>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-green-400/10 border border-green-400/20 text-green-400 font-mono text-sm font-bold flex-shrink-0">
                    +${(payment.amount_usdc || 0).toFixed(4)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No citations received yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Article Table */}
      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-space, system-ui)' }}>
            Registered Articles
          </h2>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-gray-300">
            {data.articles.length} total
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-black/20 text-gray-400">
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Article</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Base Price</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Citations</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Total Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.articles.map((art: any) => (
                <tr key={art.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-gray-200 group-hover:text-blue-400 transition-colors block mb-1 truncate max-w-sm flex items-center gap-2"
                    >
                      {art.title}
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <span className="text-xs font-mono text-gray-500 bg-black/40 px-2 py-0.5 rounded">
                      fingerprint: {art.content_fingerprint?.substring(0, 16)}...
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-mono">
                    ${art.price_usdc}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-1.5 py-0.5 rounded-full bg-blue-400/10 text-blue-400 text-xs font-bold">
                      {art.citation_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono font-medium text-green-400 bg-green-400/10 px-2.5 py-1 rounded-lg border border-green-400/20">
                      ${Number(art.total_earned_usdc || 0).toFixed(4)}
                    </span>
                  </td>
                </tr>
              ))}
              {data.articles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <BookOpen size={32} className="mx-auto mb-3 opacity-20" />
                    <p>No articles registered yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-blue-500/30 border-t-blue-500" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}