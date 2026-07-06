import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Citation Verification — Keryx',
  description: 'Verify a cryptographic citation receipt anchored on the Arc blockchain.',
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ citation_id: string }>
}) {
  const { citation_id } = await params

  const { data: receipt, error } = await supabaseAdmin
    .from('citation_receipts')
    .select('*')
    .eq('id', citation_id)
    .single()

  if (error || !receipt) {
    return (
      <main className="verify-page">
        <div className="verify-card verify-card--not-found">
          <div className="verify-icon verify-icon--error">✕</div>
          <h1>Receipt Not Found</h1>
          <p>No citation receipt exists for <code>{citation_id}</code>.</p>
          <Link href="/" className="verify-back">← Back to Keryx</Link>
        </div>
      </main>
    )
  }

  const isReal = receipt.arc_tx_hash && receipt.arc_tx_hash !== 'pending' && receipt.arc_tx_hash !== 'demo_pending'
  const arcExplorerUrl = isReal ? `https://testnet.arcscan.app/tx/${receipt.arc_tx_hash}` : null

  return (
    <main className="verify-page">
      <div className="verify-card">
        <div className="verify-badge">
          <span className="verify-icon verify-icon--success">✓</span>
          <span>Verified Payment</span>
        </div>

        <h1 className="verify-title">Citation Receipt</h1>
        <p className="verify-subtitle">
          This receipt proves an AI agent paid for and cited this article via the Keryx micropayment protocol, anchored on the Arc blockchain.
        </p>

        <div className="verify-row">
          <span className="verify-label">Article</span>
          <a href={receipt.article_url} target="_blank" rel="noopener noreferrer" className="verify-value verify-link">
            {receipt.article_title}
          </a>
        </div>

        <div className="verify-row">
          <span className="verify-label">Publisher Wallet</span>
          <span className="verify-value verify-mono">{receipt.publisher_address}</span>
        </div>

        <div className="verify-row">
          <span className="verify-label">Amount Paid</span>
          <span className="verify-value verify-amount">${Number(receipt.amount_paid_usdc).toFixed(4)} USDC</span>
        </div>

        <div className="verify-row">
          <span className="verify-label">Arc Tx Hash</span>
          {arcExplorerUrl ? (
            <a href={arcExplorerUrl} target="_blank" rel="noopener noreferrer" className="verify-value verify-mono verify-link">
              {receipt.arc_tx_hash}
            </a>
          ) : (
            <span className="verify-value verify-mono verify-pending">{receipt.arc_tx_hash}</span>
          )}
        </div>

        <div className="verify-row">
          <span className="verify-label">Content Fingerprint</span>
          <span className="verify-value verify-mono">{receipt.fingerprint}</span>
        </div>

        <div className="verify-row">
          <span className="verify-label">Cited At</span>
          <span className="verify-value">{new Date(receipt.cited_at).toUTCString()}</span>
        </div>

        <div className="verify-row">
          <span className="verify-label">Receipt ID</span>
          <span className="verify-value verify-mono">{receipt.id}</span>
        </div>

        <Link href="/" className="verify-back">← Back to Keryx</Link>
      </div>

      <style>{`
        .verify-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: var(--background, #0a0a0f);
        }
        .verify-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 2.5rem;
          max-width: 680px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .verify-card--not-found {
          align-items: center;
          text-align: center;
        }
        .verify-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.3);
          color: #22c55e;
          padding: 0.4rem 1rem;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 600;
          width: fit-content;
        }
        .verify-icon--success { font-size: 1rem; }
        .verify-icon--error { font-size: 2rem; color: #ef4444; }
        .verify-title {
          font-size: 1.6rem;
          font-weight: 700;
          margin: 0;
          color: #fff;
        }
        .verify-subtitle {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.5);
          margin: 0;
          line-height: 1.6;
        }
        .verify-row {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          padding: 1rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px;
        }
        .verify-label {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.4);
        }
        .verify-value {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.85);
          word-break: break-all;
        }
        .verify-mono {
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
        }
        .verify-link {
          color: #818cf8;
          text-decoration: none;
        }
        .verify-link:hover { text-decoration: underline; }
        .verify-amount {
          font-size: 1.1rem;
          font-weight: 700;
          color: #22c55e;
        }
        .verify-pending { color: rgba(255,255,255,0.35); }
        .verify-back {
          color: rgba(255,255,255,0.4);
          font-size: 0.85rem;
          text-decoration: none;
          margin-top: 0.5rem;
        }
        .verify-back:hover { color: rgba(255,255,255,0.7); }
      `}</style>
    </main>
  )
}
