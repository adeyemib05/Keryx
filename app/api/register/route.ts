export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { ingestRSS } from '@/lib/rss'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, wallet_address, rss_url, website_url, slug } = body

    if (!name || !email || !wallet_address || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Slug must be lowercase letters, numbers, and hyphens only' }, { status: 400 })
    }

    // Insert publisher
    const { data: publisher, error: publisherError } = await supabaseAdmin
      .from('publishers')
      .insert({
        name,
        email,
        wallet_address,
        rss_url,
        website_url,
        slug
      })
      .select()
      .single()

    if (publisherError) {
      if (publisherError.code === '23505') {
        return NextResponse.json({ error: 'Email or slug already taken' }, { status: 409 })
      }
      throw publisherError
    }

    let articlesRegistered = 0
    let registeredArticlesList: any[] = []
    let rssError = undefined

    if (rss_url) {
      try {
        const items = await ingestRSS(rss_url)
        
        const articlesToInsert = items.map(item => ({
          publisher_id: publisher.id,
          title: item.title,
          url: item.url,
          content_fingerprint: item.fingerprint,
          price_usdc: 0.001
        }))

        const { data: insertedArticles, error: articlesError } = await supabaseAdmin
          .from('articles')
          .upsert(articlesToInsert, { onConflict: 'url' })
          .select()

        if (articlesError) {
          throw articlesError
        }

        registeredArticlesList = items
        articlesRegistered = items.length
      } catch (err: any) {
        rssError = `Could not fetch RSS feed: ${err.message}`
      }
    }

    return NextResponse.json({
      publisher,
      articles_registered: articlesRegistered,
      articles: registeredArticlesList,
      ...(rssError && { rss_error: rssError })
    }, { status: 201 })
    
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
