'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, DollarSign, Zap, ExternalLink, ChevronRight, Search } from 'lucide-react';

interface Publisher {
  id: string;
  name: string;
  slug: string;
  wallet_address: string;
  total_earned_usdc: number;
  citation_count: number;
  created_at: string;
}

export default function PublishersPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/publishers')
      .then(res => res.json())
      .then(data => setPublishers(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = publishers.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-space, system-ui)' }}>
            Network Publishers
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Independent creators earning per-citation micropayments on Keryx.
          </p>
        </div>
        <Link 
          href="/register"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #4488ff, #9d4edd)', color: '#fff' }}
        >
          <Globe size={16} />
          Register yours
        </Link>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text"
          placeholder="Search publishers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all focus:border-blue-500/50"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.3)', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            color: '#fff' 
          }}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass-panel">
          <Globe size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-semibold mb-2">No publishers found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or register a new one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pub, index) => (
            <Link 
              key={pub.id} 
              href={`/publishers/${pub.slug}`}
              className="glass-panel p-6 group transition-all duration-300 hover:bg-white/[0.04] hover:-translate-y-1 hover:border-blue-500/30 block relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-blue-400 font-bold text-xl uppercase shadow-[0_0_15px_rgba(68,136,255,0.15)] group-hover:shadow-[0_0_20px_rgba(68,136,255,0.3)] transition-shadow">
                    {pub.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-blue-400 transition-colors" style={{ fontFamily: 'var(--font-space, system-ui)' }}>
                      {pub.name}
                    </h3>
                    <p className="text-xs text-gray-400">/{pub.slug}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-500 group-hover:text-blue-400 transition-colors group-hover:translate-x-1" />
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Earned</p>
                  <p className="font-mono text-green-400 font-bold flex items-center gap-1">
                    <DollarSign size={14} />
                    {(pub.total_earned_usdc || 0).toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Citations</p>
                  <p className="font-mono text-blue-400 font-bold flex items-center gap-1">
                    <Zap size={14} />
                    {pub.citation_count || 0}
                  </p>
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-white/5 relative z-10">
                <p className="text-xs font-mono text-gray-500 flex items-center gap-1.5 truncate">
                  Wallet: {pub.wallet_address.substring(0, 10)}...{pub.wallet_address.substring(36)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
