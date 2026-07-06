'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Rss, Wallet, User, Mail, Globe, Hash, CheckCircle2, AlertCircle, Loader2, Shield, Zap, BookOpen } from 'lucide-react';

const features = [
  { icon: Zap, label: 'Instant micropayments the second you're cited' },
  { icon: Shield, label: 'Sybil-resistant domain verification' },
  { icon: BookOpen, label: 'Automatic RSS ingestion & fingerprinting' },
];

interface FormField {
  id: keyof typeof defaultForm;
  label: string;
  type: string;
  placeholder: string;
  icon: React.ElementType;
  hint?: string;
  required?: boolean;
  pattern?: string;
  mono?: boolean;
}

const defaultForm = {
  name: '',
  email: '',
  wallet_address: '',
  rss_url: '',
  website_url: '',
  slug: '',
};

const fields: FormField[] = [
  { id: 'name', label: 'Publication Name', type: 'text', placeholder: 'e.g. The Block', icon: User, required: true },
  { id: 'slug', label: 'Slug (your public URL)', type: 'text', placeholder: 'e.g. the-block', icon: Hash, required: true, pattern: '[a-z0-9-]+', mono: true },
  { id: 'email', label: 'Email Address', type: 'email', placeholder: 'you@yoursite.com', icon: Mail, required: true },
  { id: 'wallet_address', label: 'Settlement Wallet Address', type: 'text', placeholder: '0x...', icon: Wallet, required: true, mono: true, hint: 'USDC payments on Arc Testnet will go here.' },
  { id: 'website_url', label: 'Website URL', type: 'url', placeholder: 'https://yoursite.com', icon: Globe, hint: 'Used for domain verification. Add TXT record: keryx-verification=<your_wallet>.' },
  { id: 'rss_url', label: 'RSS Feed URL', type: 'url', placeholder: 'https://yoursite.com/rss', icon: Rss, hint: 'We will automatically ingest and fingerprint your articles.' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setSuccess(true);
      setTimeout(() => router.push(`/dashboard?slug=${data.publisher.slug}`), 1800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col lg:flex-row gap-10 items-start justify-center max-w-5xl mx-auto w-full">
      {/* Left: Info panel */}
      <div className="lg:w-80 flex-shrink-0 lg:sticky lg:top-8">
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-400/10 text-green-400 border border-green-400/20 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Free to join
          </span>
          <h1 className="text-3xl font-black mb-3 leading-tight" style={{ fontFamily: 'var(--font-space, system-ui)' }}>
            Start earning per <span className="text-gradient">citation</span>
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            Register your publication on Keryx and get paid every time an AI agent grounds an answer in your work.
          </p>
        </div>

        <div className="space-y-4">
          {features.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-blue-400" />
              </div>
              <p className="text-sm text-gray-300 leading-snug pt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <p className="text-xs text-amber-400/80 leading-relaxed">
            <span className="font-semibold text-amber-400">Testnet note:</span> All payments are on Arc Testnet with test USDC. Do not use real funds.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 w-full">
        <div className="glass-panel p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />

          {success ? (
            <div className="flex flex-col items-center justify-center py-16 text-center relative z-10">
              <div className="w-20 h-20 rounded-full bg-green-400/10 border-2 border-green-400/30 flex items-center justify-center mb-6">
                <CheckCircle2 size={40} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-space, system-ui)' }}>You're registered!</h2>
              <p className="text-gray-400 text-sm">Redirecting to your dashboard…</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-6 relative z-10" style={{ fontFamily: 'var(--font-space, system-ui)' }}>
                Publication Details
              </h2>

              {error && (
                <div className="flex items-start gap-3 p-4 mb-6 rounded-xl border border-red-500/30 bg-red-500/10 relative z-10">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                {fields.map(({ id, label, type, placeholder, icon: Icon, hint, required, pattern, mono }) => (
                  <div key={id}>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      {label} {required && <span className="text-blue-400">*</span>}
                    </label>
                    <div className="relative">
                      <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        required={required}
                        type={type}
                        placeholder={placeholder}
                        pattern={pattern}
                        className={`form-input pl-11 ${mono ? 'font-mono text-sm' : ''}`}
                        value={form[id]}
                        onChange={e => setForm({ ...form, [id]: id === 'slug' ? e.target.value.toLowerCase() : e.target.value })}
                      />
                    </div>
                    {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  id="register-submit-btn"
                  className="w-full py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 mt-2"
                  style={{ background: 'linear-gradient(135deg, #4488ff, #9d4edd)', color: '#fff', boxShadow: '0 4px 20px rgba(68, 136, 255, 0.3)' }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Registering & Ingesting RSS…
                    </>
                  ) : (
                    <>
                      <Rss size={18} />
                      Register Publication
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 pt-2">
                  Already registered?{' '}
                  <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 font-medium">
                    View Dashboard
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
