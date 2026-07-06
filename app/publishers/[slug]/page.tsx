'use client';

import { useEffect, useState, use } from 'react';
import CitationFeed from '@/components/CitationFeed';
import EarningsWidget from '@/components/EarningsWidget';

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

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (error) return <div className="p-20 text-center text-red-400">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto py-16 px-6 w-full">
      <div className="text-center mb-12">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          Verified Publisher
        </div>
        <h1 className="text-4xl font-black mb-2">{data.publisher.name}</h1>
        {data.publisher.website_url && (
          <a href={data.publisher.website_url} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: 'var(--accent-blue)' }}>
            {data.publisher.website_url}
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-xl font-bold mb-4">Earnings via Keryx</h2>
          <EarningsWidget initialUsdc={Number(data.stats.total_earned_usdc || 0)} />
          <div className="mt-4 flex gap-4 text-center">
            <div className="flex-1 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="text-2xl font-bold">{data.stats.citation_count}</div>
              <div className="text-xs uppercase mt-1" style={{ color: 'var(--text-muted)' }}>Citations</div>
            </div>
            <div className="flex-1 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="text-2xl font-bold">{data.stats.article_count}</div>
              <div className="text-xs uppercase mt-1" style={{ color: 'var(--text-muted)' }}>Articles</div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Live Citation Feed</h2>
          <div className="p-4 rounded-xl border min-h-[300px]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <CitationFeed initialPayments={data.recent_payments} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Citable Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.articles.map((art: any) => (
            <a 
              key={art.id} 
              href={art.url}
              target="_blank"
              rel="noreferrer"
              className="p-5 rounded-xl border transition-colors hover:border-white/30"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
              <h3 className="font-semibold mb-2 line-clamp-2 leading-snug">{art.title}</h3>
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: 'var(--text-muted)' }}>{art.citation_count} citations</span>
                <span className="font-mono font-medium" style={{ color: 'var(--usdc-blue)' }}>${art.price_usdc} USDC</span>
              </div>
            </a>
          ))}
          {data.articles.length === 0 && (
            <div className="col-span-2 p-8 text-center text-muted" style={{ color: 'var(--text-muted)' }}>
              No articles registered yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
