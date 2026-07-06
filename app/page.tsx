'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Send, Sparkles, Clock, ExternalLink, CheckCircle2,
  ChevronDown, ChevronRight, Trash2, History, X,
  DollarSign, Zap, AlertCircle, Copy, Check
} from 'lucide-react';

// ------- Types -------
interface Citation {
  article_id: string;
  title: string;
  url: string;
  publisher_name: string;
  amount_paid_usdc: number;
  arc_tx_hash: string;
  fingerprint: string;
  reason: string;
}
interface AgentResult {
  answer: string;
  citations: Citation[];
  reasoning_trace: string[];
  total_spent_usdc: number;
  budget_remaining_usdc: number;
  sources_evaluated: number;
  sources_paid: number;
}
interface ConversationEntry {
  id: string;
  question: string;
  result: AgentResult;
  timestamp: number;
}

const HISTORY_KEY = 'keryx_history';

const SUGGESTED = [
  "What's happening in AI regulation?",
  "Summarise the latest on quantum computing",
  "Any news about EVs and clean energy?",
  "What are the biggest cybersecurity threats this week?",
];

// ------- Sub-components -------
function CitationCard({ cite, index }: { cite: Citation; index: number }) {
  const [copied, setCopied] = useState(false);
  const isSettled = cite.arc_tx_hash && cite.arc_tx_hash !== 'settlement_failed' && cite.arc_tx_hash !== 'demo_pending';
  const explorerUrl = `https://testnet.arc.network/tx/${cite.arc_tx_hash}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cite.arc_tx_hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="rounded-2xl p-4 transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${isSettled ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.07)'}`,
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <a
            href={cite.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold line-clamp-2 hover:underline"
            style={{ color: '#4488ff' }}
          >
            {cite.title}
          </a>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {cite.publisher_name}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <div
            className="px-2 py-1 rounded-lg text-xs font-bold font-mono"
            style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}
          >
            ${cite.amount_paid_usdc.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Tx Hash */}
      <div className="mt-3 flex items-center gap-2">
        {isSettled ? (
          <CheckCircle2 size={12} className="flex-shrink-0" style={{ color: '#00ff88' }} />
        ) : (
          <AlertCircle size={12} className="flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
        )}
        <span className="text-xs font-mono truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {cite.arc_tx_hash}
        </span>
        {isSettled && (
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
            <button onClick={handleCopy} title="Copy tx hash" className="hover:opacity-60 transition-opacity">
              {copied ? <Check size={11} style={{ color: '#00ff88' }} /> : <Copy size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />}
            </button>
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer" title="View on Arc Explorer">
              <ExternalLink size={11} style={{ color: 'rgba(255,255,255,0.3)' }} className="hover:opacity-60 transition-opacity" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex items-end gap-3 mb-6">
      <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(68,136,255,0.15)', border: '1px solid rgba(68,136,255,0.3)' }}>
        <Sparkles size={14} style={{ color: '#4488ff' }} />
      </div>
      <div className="px-5 py-4 rounded-2xl rounded-bl-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', maxWidth: '420px' }}>
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Agent is thinking</span>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#4488ff', animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentMessage({ entry }: { entry: ConversationEntry }) {
  const [showTrace, setShowTrace] = useState(false);
  const { result } = entry;
  const paidCitations = result.citations?.filter(c => c.arc_tx_hash !== 'demo_pending') || [];
  const demoCitations = result.citations?.filter(c => c.arc_tx_hash === 'demo_pending') || [];
  const allCitations = result.citations || [];

  return (
    <div className="flex items-start gap-3 mb-8">
      <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-1" style={{ background: 'rgba(68,136,255,0.15)', border: '1px solid rgba(68,136,255,0.3)' }}>
        <Sparkles size={14} style={{ color: '#4488ff' }} />
      </div>
      <div className="flex-1 min-w-0">
        {/* Answer */}
        <div className="rounded-2xl rounded-tl-sm p-5 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)', whiteSpace: 'pre-wrap' }}>
            {result.answer}
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {result.total_spent_usdc > 0 && (
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}>
              <DollarSign size={11} />
              ${result.total_spent_usdc.toFixed(4)} USDC paid
            </div>
          )}
          {allCitations.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(68,136,255,0.08)', color: '#4488ff', border: '1px solid rgba(68,136,255,0.2)' }}>
              <CheckCircle2 size={11} />
              {allCitations.length} citation{allCitations.length > 1 ? 's' : ''}
            </div>
          )}
          {paidCitations.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(157,78,221,0.08)', color: '#9d4edd', border: '1px solid rgba(157,78,221,0.2)' }}>
              <Zap size={11} />
              {paidCitations.length} on-chain
            </div>
          )}
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Citations */}
        {allCitations.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Paid Citations
            </p>
            <div className="flex flex-col gap-2">
              {allCitations.map((cite, i) => (
                <CitationCard key={cite.fingerprint || i} cite={cite} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Arc Transactions section for on-chain txs */}
        {paidCitations.length > 0 && (
          <div className="mb-4 p-4 rounded-2xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,255,136,0.1)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold" style={{ color: '#00ff88' }}>🔗 Arc Network Transactions</p>
              <a
                href="https://testnet.arc.network"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs hover:opacity-70 transition-opacity"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                View all <ExternalLink size={10} />
              </a>
            </div>
            <div className="flex flex-col gap-2">
              {paidCitations.map((cite, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="truncate mr-4" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '200px' }}>{cite.title}</span>
                  <a
                    href={`https://testnet.arc.network/tx/${cite.arc_tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs flex items-center gap-1 flex-shrink-0 hover:opacity-70 transition-opacity"
                    style={{ color: '#00ff88' }}
                  >
                    {cite.arc_tx_hash.slice(0, 8)}...{cite.arc_tx_hash.slice(-4)}
                    <ExternalLink size={9} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reasoning trace */}
        {result.reasoning_trace?.length > 0 && (
          <button
            onClick={() => setShowTrace(t => !t)}
            className="flex items-center gap-2 text-xs transition-opacity hover:opacity-80"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {showTrace ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            {showTrace ? 'Hide' : 'Show'} reasoning trace ({result.reasoning_trace.length} steps)
          </button>
        )}
        {showTrace && (
          <div className="mt-3 p-4 rounded-xl space-y-2" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
            {result.reasoning_trace.map((step, i) => (
              <div key={i} className="flex gap-3 text-xs">
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
                  {i + 1}
                </span>
                <span className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryPanel({ history, onSelect, onClear, onClose }: {
  history: ConversationEntry[];
  onSelect: (e: ConversationEntry) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="flex flex-col h-full"
      style={{ width: '280px', borderLeft: '1px solid rgba(255,255,255,0.07)', background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(20px)' }}
    >
      <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2">
          <History size={15} style={{ color: '#4488ff' }} />
          <span className="text-sm font-semibold">History</span>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button onClick={onClear} title="Clear history" className="hover:opacity-60 transition-opacity">
              <Trash2 size={14} style={{ color: 'rgba(255,255,255,0.35)' }} />
            </button>
          )}
          <button onClick={onClose} className="hover:opacity-60 transition-opacity">
            <X size={14} style={{ color: 'rgba(255,255,255,0.35)' }} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Clock size={28} style={{ color: 'rgba(255,255,255,0.1)' }} className="mb-3" />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No history yet</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Ask the agent a question to get started</p>
          </div>
        ) : (
          history.slice().reverse().map(entry => (
            <button
              key={entry.id}
              onClick={() => onSelect(entry)}
              className="w-full text-left p-3 rounded-xl transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <p className="text-xs font-medium line-clamp-2 mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {entry.question}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {new Date(entry.timestamp).toLocaleDateString()}
                </span>
                {entry.result.citations?.length > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,255,136,0.08)', color: '#00ff88' }}>
                    {entry.result.citations.length} cites
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ------- Main Page -------
export default function Home() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [history, setHistory] = useState<ConversationEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  // Load stats
  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, loading]);

  const saveToHistory = (entry: ConversationEntry) => {
    setHistory(prev => {
      const updated = [...prev, entry];
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const handleAskAgent = async (q?: string) => {
    const query = q || question;
    if (!query.trim() || loading) return;
    setQuestion('');
    setLoading(true);

    // Add user message to conversation
    const userEntry = { id: `u_${Date.now()}`, question: query, result: null as any, timestamp: Date.now() };
    setConversation(prev => [...prev, userEntry]);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query, budget_usdc: 0.05 }),
      });
      const data: AgentResult = await res.json();
      const entry: ConversationEntry = { id: `e_${Date.now()}`, question: query, result: data, timestamp: Date.now() };
      setConversation(prev => prev.filter(e => e.id !== userEntry.id).concat(entry));
      saveToHistory(entry);
    } catch (err) {
      const errEntry: ConversationEntry = {
        id: `e_${Date.now()}`,
        question: query,
        result: { answer: 'Sorry, something went wrong. Please try again.', citations: [], reasoning_trace: [], total_spent_usdc: 0, budget_remaining_usdc: 0.05, sources_evaluated: 0, sources_paid: 0 },
        timestamp: Date.now(),
      };
      setConversation(prev => prev.filter(e => e.id !== userEntry.id).concat(errEntry));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAskAgent(); }
  };

  const handleHistorySelect = (entry: ConversationEntry) => {
    setConversation(prev => [...prev, entry]);
    setShowHistory(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleHistoryClear = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const isEmpty = conversation.length === 0 && !loading;

  return (
    <div className="flex h-full">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-h-0">
        {isEmpty ? (
          /* ---- EMPTY STATE: Hero ---- */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            {/* Animated logo */}
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-full blur-2xl opacity-20 animate-pulse" style={{ background: 'radial-gradient(circle, #4488ff, #9d4edd)' }} />
              <svg width="72" height="72" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" className="relative">
                <style>{`
                  @keyframes kD { 0% { stroke-dashoffset: 200; } 100% { stroke-dashoffset: 0; } }
                  @keyframes kG { 0%,100%{opacity:.5;filter:drop-shadow(0 0 4px rgba(68,136,255,.5))} 50%{opacity:1;filter:drop-shadow(0 0 16px rgba(68,136,255,1))} }
                  .hw{stroke-dasharray:200;animation:kD 3s ease-in-out infinite alternate}
                  .hd{animation:kG 2s ease-in-out infinite}
                `}</style>
                <circle cx="48" cy="48" r="44" fill="none" stroke="#4488ff" strokeWidth="2" opacity="0.2"/>
                <circle cx="48" cy="48" r="32" fill="#4488ff0a" stroke="#4488ff" strokeWidth="1.5"/>
                <polyline className="hw" points="4,48 20,48 30,26 44,70 56,32 66,48 92,48" fill="none" stroke="#4488ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle className="hd" cx="44" cy="70" r="5" fill="#4488ff"/>
                <circle className="hd" cx="44" cy="70" r="9" fill="none" stroke="#4488ff" strokeWidth="1.5" opacity="0.4"/>
              </svg>
            </div>

            <h2 className="text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: 'var(--font-space, system-ui)' }}>
              What would you like to know?
            </h2>
            <p className="text-base max-w-md mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Ask anything. The agent will research the web, pay publishers per citation, and return a fully sourced answer.
            </p>

            {/* Stats pills */}
            {stats && (
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {[
                  { label: 'USDC Paid', value: `$${(stats.total_paid_usdc || 0).toFixed(4)}`, color: '#00ff88' },
                  { label: 'Citations', value: stats.total_citations || 0, color: '#4488ff' },
                  { label: 'Publishers', value: stats.total_publishers || 0, color: '#9d4edd' },
                  { label: 'Articles', value: stats.total_articles || 0, color: '#f59e0b' },
                ].map(s => (
                  <div key={s.label} className="px-4 py-2.5 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-xl font-bold" style={{ color: s.color, fontFamily: 'var(--font-space, system-ui)' }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested questions */}
            <div className="flex flex-wrap justify-center gap-2 max-w-xl">
              {SUGGESTED.map(q => (
                <button
                  key={q}
                  onClick={() => handleAskAgent(q)}
                  className="px-4 py-2 rounded-xl text-sm transition-all duration-200 hover:scale-105 hover:bg-white/8 active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)' }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ---- CHAT MESSAGES ---- */
          <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl mx-auto w-full">
            {conversation.map(entry => (
              <div key={entry.id}>
                {/* User bubble */}
                <div className="flex justify-end mb-4">
                  <div
                    className="max-w-md px-5 py-3 rounded-2xl rounded-tr-sm text-sm"
                    style={{ background: 'rgba(68,136,255,0.15)', border: '1px solid rgba(68,136,255,0.25)', color: '#fff' }}
                  >
                    {entry.question}
                  </div>
                </div>
                {/* Agent response */}
                {entry.result ? (
                  <AgentMessage entry={entry} />
                ) : (
                  loading && <ThinkingBubble />
                )}
              </div>
            ))}
            {loading && conversation.length > 0 && conversation[conversation.length - 1].result && (
              <ThinkingBubble />
            )}
            <div ref={chatEndRef} />
          </div>
        )}

        {/* ---- INPUT BAR ---- */}
        <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(5,5,8,0.8)', backdropFilter: 'blur(20px)' }}>
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            {/* History toggle */}
            <button
              onClick={() => setShowHistory(h => !h)}
              title="Conversation history"
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:bg-white/5"
              style={{
                background: showHistory ? 'rgba(68,136,255,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${showHistory ? 'rgba(68,136,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: showHistory ? '#4488ff' : 'rgba(255,255,255,0.4)',
              }}
            >
              <History size={16} />
            </button>

            {/* Input */}
            <div className="flex-1 flex items-center rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <input
                ref={inputRef}
                id="agent-question-input"
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything — the agent will cite its sources…"
                disabled={loading}
                className="flex-1 bg-transparent px-4 py-3 text-sm outline-none disabled:opacity-50"
                style={{ color: '#fff', caretColor: '#4488ff' }}
              />
              {question && (
                <button onClick={() => setQuestion('')} className="px-2 opacity-40 hover:opacity-70 transition-opacity">
                  <X size={14} style={{ color: '#fff' }} />
                </button>
              )}
            </div>

            {/* Send */}
            <button
              onClick={() => handleAskAgent()}
              disabled={loading || !question.trim()}
              id="ask-agent-btn"
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100"
              style={{ background: 'linear-gradient(135deg, #4488ff, #9d4edd)', color: '#fff' }}
            >
              <Send size={16} />
            </button>
          </div>

          <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Budget: $0.05 USDC per query · Powered by Circle x402 on Arc Testnet
          </p>
        </div>
      </div>

      {/* ---- HISTORY PANEL ---- */}
      {showHistory && (
        <HistoryPanel
          history={history}
          onSelect={handleHistorySelect}
          onClear={handleHistoryClear}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
