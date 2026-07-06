'use client';

import { useEffect, useState, use } from 'react';
import { ExternalLink, DollarSign, BookOpen, Zap, ShieldCheck, Search, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function PublisherProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/publishers/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Publisher not found');
        return res.json();
      })
      .then(d => setData(d))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-screen w-full">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-blue-500/30 border-t-blue-500" />
    </div>
  );

  if (error) return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-8 text-center w-full">
      <Search size={48} className="text-gray-500 mb-6 opacity-50" />
      <h2 className="text-xl font-bold mb-2">Publisher Not Found</h2>
      <p className="text-gray-400 mb-8 max-w-sm mx-auto">{error}</p>
      <Link 
        href="/publishers" 
        className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 bg-white/5 border border-white/10 hover:bg-white/10"
      >
        View All Publishers
      </Link>
    </div>
  );

  if (!data) return null;

  const { publisher, stats, articles, recent_payments } = data;

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      {/* Profile Header */}
      <div className="relative mb-12">
        {/* Abstract Cover Photo */}
        <div className="h-48 rounded-3xl w-full overflow-hidden relative mb-[-64px]">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/20" />
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 150%, rgba(68,136,255,0.8), transparent 50%), radial-gradient(circle at 80% -50%, rgba(157,78,221,0.8), transparent 50%)' }} />
        </div>

        <div className="px-8 flex flex-col sm:flex-row gap-6 items-end relative z-10">
          <div className="w-32 h-32 rounded-3xl bg-black border-4 border-[#050508] flex items-center justify-center text-4xl font-bold uppercase shadow-2xl shrink-0" style={{ background: 'linear-gradient(135deg, rgba(68,136,255,0.2), rgba(157,78,221,0.2))', color: '#4488ff', boxShadow: '0 0 40px rgba(68,136,255,0.2)' }}>
            {publisher.name.charAt(0)}
          </div>
          
          <div className="pb-2 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-400/10 text-green-400 border border-green-400/20">
                  <ShieldCheck size={12} /> Verified Network Publisher
                </span>
              </div>
              <h1 className="text-4xl font-black mb-1" style={{ fontFamily: 'var(--font-space, system-ui)' }}>
                {publisher.name}
              </h1>
              {publisher.website_url && (
                <a 
                  href={publisher.website_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1.5 text-sm"
                >
                  <LinkIcon size={14} />
                  {publisher.website_url.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
            
            <a
              href={`https://testnet.arcscan.app/address/${publisher.wallet_address}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/10 border border-white/10 shrink-0"
            >
              Verify Wallet <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-panel p-6 relative overflow-hidden group border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={64} className="text-green-400" />
          </div>
          <p className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>Total Network Earnings</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold font-mono text-green-400">
              ${Number(stats.total_earned_usdc || 0).toFixed(4)}
            </span>
            <span className="text-sm text-green-400/50 mb-1">USDC</span>
          </div>
        </div>

        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={64} className="text-blue-400" />
          </div>
          <p className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>Total Citations</p>
          <span className="text-4xl font-bold font-mono text-blue-400">
            {stats.citation_count}
          </span>
        </div>

        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen size={64} className="text-purple-400" />
          </div>
          <p className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>Citable Articles</p>
          <span className="text-4xl font-bold font-mono text-purple-400">
            {stats.article_count}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Citable Articles */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-space, system-ui)' }}>Published Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {articles.map((art: any) => (
              <a 
                key={art.id} 
                href={art.url}
                target="_blank"
                rel="noreferrer"
                className="glass-panel p-5 group transition-all duration-300 hover:bg-white/[0.04] hover:-translate-y-1 block relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <h3 className="font-semibold mb-3 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors relative z-10">
                  {art.title}
                </h3>
                
                <div className="flex justify-between items-center text-sm relative z-10 mt-auto pt-4 border-t border-white/5">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Zap size={14} className="text-blue-400" /> {art.citation_count} citations
                  </span>
                  <span className="font-mono font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
                    ${art.price_usdc}
                  </span>
                </div>
              </a>
            ))}
            {articles.length === 0 && (
              <div className="col-span-full p-12 text-center glass-panel">
                <BookOpen size={32} className="mx-auto mb-4 opacity-20" />
                <p className="text-gray-400">No articles registered yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Citation Feed */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-space, system-ui)' }}>Live Feed</h2>
          <div className="glass-panel p-5">
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {recent_payments && recent_payments.length > 0 ? (
                recent_payments.map((payment: any, i: number) => (
                  <div key={payment.id || i} className="p-4 rounded-xl bg-black/40 border border-white/5 hover:bg-white/5 transition-colors">
                    <p className="text-sm font-medium text-gray-200 line-clamp-2 mb-2 leading-snug">
                      {payment.articles?.title || payment.article_title || 'Unknown Article'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 rounded-md bg-green-400/10 text-green-400 font-mono text-xs font-bold">
                        +${(payment.amount_usdc || 0).toFixed(4)}
                      </span>
                      <a 
                        href={`https://testnet.arcscan.app/tx/${payment.arc_tx_hash}`} 
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-gray-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
                      >
                        {payment.arc_tx_hash ? `${payment.arc_tx_hash.slice(0, 8)}...` : 'Pending'}
                        <ExternalLink size={10} />
                      </a>
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
      </div>
    </div>
  );
}
