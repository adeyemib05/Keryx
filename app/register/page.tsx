'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    wallet_address: '',
    rss_url: '',
    website_url: '',
    slug: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push(`/dashboard?slug=${data.publisher.slug}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-2">Register your Publication</h1>
      <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
        Join Keryx to instantly monetize your content when AI agents cite your work.
      </p>

      {error && (
        <div className="p-4 mb-6 rounded border border-red-500/50 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Publication Name *</label>
          <input 
            required 
            type="text"
            className="w-full px-4 py-3 rounded-lg border outline-none"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Slug (URL path) *</label>
          <input 
            required 
            pattern="[a-z0-9-]+"
            placeholder="e.g. banjo-dev"
            className="w-full px-4 py-3 rounded-lg border outline-none font-mono text-sm"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            value={form.slug}
            onChange={e => setForm({...form, slug: e.target.value.toLowerCase()})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Email *</label>
          <input 
            required 
            type="email"
            className="w-full px-4 py-3 rounded-lg border outline-none"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Circle Agent Wallet Address *</label>
          <input 
            required 
            type="text"
            placeholder="0x..."
            className="w-full px-4 py-3 rounded-lg border outline-none font-mono text-sm"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            value={form.wallet_address}
            onChange={e => setForm({...form, wallet_address: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>RSS Feed URL</label>
          <input 
            type="url"
            placeholder="https://example.com/rss"
            className="w-full px-4 py-3 rounded-lg border outline-none"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            value={form.rss_url}
            onChange={e => setForm({...form, rss_url: e.target.value})}
          />
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>We will automatically ingest and fingerprint your latest articles.</p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 rounded-lg font-bold text-lg disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: 'var(--usdc-blue)', color: '#fff' }}
        >
          {loading ? 'Registering & Ingesting RSS...' : 'Register Publication'}
        </button>
      </form>
    </div>
  );
}
