export const runtime = 'nodejs'

/*
  FREE PREVIEW endpoint — no payment required.
  Returns a 300-char excerpt of article metadata so the agent can evaluate
  relevance BEFORE deciding to pay. This is what makes Keryx "pay-per-citation"
  rather than "pay-to-access": the agent reads a preview for free, then only
  triggers a payment if the content is worth citing.

  SQL for citation_receipts table (run once in Supabase SQL editor):

  create table citation_receipts (
    id text primary key,
    article_title text,
    article_url text,
    publisher_address text,
    amount_paid_usdc numeric,
    arc_tx_hash text,
    cited_at timestamptz default now(),
    fingerprint text,
    verify_url text
  );
  alter table citation_receipts enable row level security;
  create policy "Public read" on citation_receipts for select using (true);
*/

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fingerprint: string }> }
) {
  const { fingerprint } = await params

  const { data: article, error } = await supabaseAdmin
    .from('articles')
    .select('*, publishers(name, slug)')
    .eq('content_fingerprint', fingerprint)
    .single()

  if (error || !article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  const publisherRecord = (article as any).publishers

  // Build a meaningful preview from what we have — title + URL domain is
  // enough context for an LLM to judge relevance without exposing full content.
  // We also include a snippet derived from the URL path (meaningful keywords).
  const urlSlug = (() => {
    try {
      const u = new URL(article.url)
      return decodeURIComponent(u.pathname)
        .replace(/[-_/]/g, ' ')
        .replace(/\.\w+$/, '')
        .trim()
        .slice(0, 200)
    } catch {
      return ''
    }
  })()

  const preview = urlSlug
    ? `${article.title}. ${urlSlug}`.slice(0, 300)
    : article.title.slice(0, 300)

  return NextResponse.json({
    title: article.title,
    url: article.url,
    publisher: publisherRecord?.name || 'Unknown',
    price_usdc: article.price_usdc || 0.001,
    preview,
    preview_truncated: true,
    fingerprint,
  })
}
