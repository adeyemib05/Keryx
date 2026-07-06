export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // 1. Count publishers
    const { count: total_publishers, error: pubError } = await supabaseAdmin
      .from('publishers')
      .select('*', { count: 'exact', head: true })
      
    if (pubError) throw pubError

    // 2. Count articles
    const { count: total_articles, error: artError } = await supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact', head: true })
      
    if (artError) throw artError

    // 3. Sum payments and count citations
    const { data: payments, error: payError } = await supabaseAdmin
      .from('citation_payments')
      .select('amount_usdc')

    if (payError) throw payError

    const total_citations = payments?.length || 0
    const total_paid_usdc = payments?.reduce((acc, p) => acc + Number(p.amount_usdc), 0) || 0

    // 4. Recent payments — join articles and publishers then flatten
    const { data: raw_payments, error: recError } = await supabaseAdmin
      .from('citation_payments')
      .select('*, articles(title, url), publishers(name, slug)')
      .order('created_at', { ascending: false })
      .limit(20)

    if (recError) throw recError

    // Flatten nested joins into flat fields the Explorer expects
    const recent_payments = (raw_payments || []).map((p: any) => ({
      id: p.id,
      article_title: p.articles?.title || null,
      article_url: p.articles?.url || null,
      publisher_name: p.publishers?.name || null,
      publisher_slug: p.publishers?.slug || null,
      amount_usdc: p.amount_usdc,
      arc_tx_hash: p.arc_tx_hash,
      payer_address: p.payer_address,
      created_at: p.created_at,
    }))

    return NextResponse.json({
      total_publishers: total_publishers || 0,
      total_articles: total_articles || 0,
      total_paid_usdc,
      total_citations,
      recent_payments
    }, { status: 200 })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
