export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // 1. Fetch publisher
    const { data: publisher, error: pubError } = await supabaseAdmin
      .from('publishers')
      .select('*')
      .eq('slug', slug)
      .single()

    if (pubError || !publisher) {
      return NextResponse.json({ error: 'Publisher not found' }, { status: 404 })
    }

    // 2. Fetch publisher's articles
    const { data: articles, error: artError } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('publisher_id', publisher.id)
      .order('total_earned_usdc', { ascending: false })
      .limit(20)

    if (artError) throw artError

    // 3. Fetch recent payments
    const { data: recent_payments, error: payError } = await supabaseAdmin
      .from('citation_payments')
      .select('*, articles(title, url)')
      .eq('publisher_id', publisher.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (payError) throw payError

    return NextResponse.json({
      publisher,
      articles,
      recent_payments,
      stats: {
        total_earned_usdc: publisher.total_earned_usdc,
        citation_count: publisher.citation_count,
        article_count: articles?.length || 0
      }
    }, { status: 200 })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
