'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import EarningsWidget from '@/components/EarningsWidget';
import CitationFeed from '@/components/CitationFeed';
import Link from 'next/link';

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
      <div className="max-w-md mx-auto py-20 px-6 text-center">
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          View your Dashboard
        </h2>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Enter your publication slug to access your earnings
        </p>
        <div className="flex gap-2">
          <input
            className="flex-1 px-4 py-2 rounded-lg border outline-none"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            placeholder="your-slug"
            value={inputSlug}
            onChange={e => setInputSlug(e.target.value.toLowerCase())}
            onKeyDown={e => {
              if (e.key === 'Enter' && inputSlug) {
                window.location.href = `/dashboard?slug=${inputSlug}`;
              }
            }}
          />
          <button
            onClick={() => { if (inputSlug) window.location.href = `/dashboard?slug=${inputSlug}`; }}
            className="px-4 py-2 rounded-lg font-semibold"
            style={{ backgroundColor: 'var(--accent-blue)', color: '#fff' }}
          >
            Go
          </button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="p-20 text-center" style={{ color: 'var(--text-secondary)' }}>
      Loading dashboard...
    </div>
  );

  if (error) return (
    <div className="p-20 text-center">
      <p className="text-red-400 mb-4">{error}</p>
      <Link href="/register" style={{ color: 'var(--accent-blue)' }}>
        Register your publication →
      </Link>
    </div>
  );

  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {data.publisher.name}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Dashboard & Earnings</p>
        </div>
        <Link
          href={`/publishers/${slug}`}
          className="px-4 py-2 rounded-lg text-sm border hover:opacity-80 transition-opacity"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          View Public Profile ↗
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Total Earned</p>
          <EarningsWidget initialUsdc={Number(data.stats.total_earned_usdc || 0)} />
        </div>
        <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Total Citations</p>
          <p className="text-3xl font-bold font-mono" style={{ color: 'var(--accent-blue)' }}>
            {data.stats.citation_count}
          </p>
        </div>
        <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Articles Registered</p>
          <p className="text-3xl font-bold font-mono" style={{ color: 'var(--accent-purple)' }}>
            {data.stats.article_count}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-1 p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
            Wallet
          </h3>
          <p className="text-xs font-mono break-all mb-3" style={{ color: 'var(--text-primary)' }}>
            {data.publisher.wallet_address}
          </p>
          
          <a
            href={`https://testnet.arcscan.app/address/${data.publisher.wallet_address}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs hover:underline"
            style={{ color: 'var(--accent-blue)' }}
          >
            View on Arc Explorer &#x2197;
          </a>
        </div>

        <div className="md:col-span-2 p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Citations</h2>
          <CitationFeed initialPayments={data.recent_payments} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Registered Articles ({data.articles.length})
        </h2>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-left text-sm">
            <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <tr>
                <th className="px-6 py-4 font-medium" style={{ color: 'var(--text-muted)' }}>Article</th>
                <th className="px-6 py-4 font-medium" style={{ color: 'var(--text-muted)' }}>Price</th>
                <th className="px-6 py-4 font-medium" style={{ color: 'var(--text-muted)' }}>Citations</th>
                <th className="px-6 py-4 font-medium text-right" style={{ color: 'var(--text-muted)' }}>Earned</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'var(--bg-card)' }}>
              {data.articles.map((art: any, i: number) => (
                <tr key={art.id} style={{ borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <td className="px-6 py-4">
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium hover:underline block mb-1 truncate max-w-xs"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {art.title}
                    </a>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {art.content_fingerprint?.substring(0, 16)}...
                    </span>
                  </td>
                  <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                    ${art.price_usdc}
                  </td>
                  <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                    {art.citation_count}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-medium" style={{ color: 'var(--accent-green)' }}>
                    ${Number(art.total_earned_usdc || 0).toFixed(4)}
                  </td>
                </tr>
              ))}
              {data.articles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                    No articles registered yet.
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
      <div className="p-20 text-center" style={{ color: 'var(--text-secondary)' }}>
        Loading...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}