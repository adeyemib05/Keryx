'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CitationFeed from '@/components/CitationFeed';

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentResult, setAgentResult] = useState<any>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  const handleAskAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question) return;
    
    setLoading(true);
    setAgentResult(null);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, budget_usdc: 0.05 })
      });
      const data = await res.json();
      setAgentResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="px-6 py-24 text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-6" style={{ backgroundColor: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}>
          Built on Circle & Arc Testnet
        </div>
        <div className="flex justify-center mb-6">
          <svg width="56" height="56" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
            <circle cx="48" cy="48" r="44" fill="none" stroke="#4488ff" strokeWidth="2" opacity="0.25"/>
            <circle cx="48" cy="48" r="32" fill="#4488ff10" stroke="#4488ff" strokeWidth="2"/>
            <polyline
              className="keryx-wave"
              points="4,48 20,48 30,26 44,70 56,32 66,48 92,48"
              fill="none"
              stroke="#4488ff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"/>
            <circle className="keryx-dot" cx="44" cy="70" r="5" fill="#4488ff"/>
            <circle className="keryx-dot" cx="44" cy="70" r="9" fill="none" stroke="#4488ff" strokeWidth="1.5" opacity="0.4"/>
          </svg>
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 max-w-4xl tracking-tight leading-tight">
          AI agents pay you <br/>
          <span style={{ color: 'var(--accent-blue)' }}>every time they cite your work</span>
        </h1>
        <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
          Keryx is a gasless, per-citation micropayment toll layer for independent publishers. Register your RSS feed and get paid instantly in USDC.
        </p>
        <Link 
          href="/register" 
          className="px-8 py-4 rounded-lg font-bold text-lg transition-transform hover:scale-105"
          style={{ backgroundColor: 'var(--usdc-blue)', color: '#fff' }}
        >
          Register your publication →
        </Link>
      </section>

      {/* Demo Section */}
      <section className="px-6 py-20 border-t" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Try the Demo Agent</h2>
            <p style={{ color: 'var(--text-muted)' }}>Ask a question. The agent will fetch relevant content, pay the publisher in real-time, and cite the source.</p>
          </div>

          <form onSubmit={handleAskAgent} className="flex gap-4 mb-8">
            <input 
              type="text" 
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g. What is the economic impact of AI on journalism?"
              className="flex-1 px-4 py-3 rounded-lg border outline-none"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            <button 
              type="submit" 
              disabled={loading || !question}
              className="px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent-purple)', color: '#fff' }}
            >
              {loading ? 'Agent Thinking...' : 'Ask Agent'}
            </button>
          </form>

          {agentResult && (
            <div className="p-6 rounded-xl border mb-12" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
              <h3 className="font-bold text-xl mb-4">Agent Answer</h3>
              <div className="prose prose-invert max-w-none whitespace-pre-wrap mb-6" style={{ color: 'var(--text-secondary)' }}>
                {agentResult.answer}
              </div>
              
              {agentResult.citations?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Paid Citations</h4>
                  <div className="flex flex-col gap-2">
                    {agentResult.citations.map((cite: any, i: number) => (
                      <div key={i} className="p-3 rounded border text-sm flex justify-between items-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                        <div>
                          <a href={cite.url} target="_blank" className="font-medium hover:underline" style={{ color: 'var(--accent-blue)' }}>{cite.title}</a>
                          <span className="mx-2 text-xs" style={{ color: 'var(--text-muted)' }}>by {cite.publisher_name}</span>
                        </div>
                        <div className="font-mono text-xs font-semibold" style={{ color: 'var(--accent-green)' }}>
                          ${cite.amount_paid_usdc} USDC
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats & Live Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Platform Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--usdc-blue)' }}>${stats?.total_paid_usdc?.toFixed(3) || '0.000'}</div>
                  <div className="text-xs uppercase mt-1" style={{ color: 'var(--text-muted)' }}>Total USDC Paid</div>
                </div>
                <div className="p-4 rounded-lg border text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.total_citations || 0}</div>
                  <div className="text-xs uppercase mt-1" style={{ color: 'var(--text-muted)' }}>Citations</div>
                </div>
                <div className="p-4 rounded-lg border text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.total_articles || 0}</div>
                  <div className="text-xs uppercase mt-1" style={{ color: 'var(--text-muted)' }}>Articles</div>
                </div>
                <div className="p-4 rounded-lg border text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.total_publishers || 0}</div>
                  <div className="text-xs uppercase mt-1" style={{ color: 'var(--text-muted)' }}>Publishers</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Live Citation Feed</h3>
              <div className="p-4 rounded-lg border h-64 overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                {stats?.recent_payments ? (
                  <CitationFeed initialPayments={stats.recent_payments} />
                ) : (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading feed...</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
