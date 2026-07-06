export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ingestRSS } from '@/lib/rss';

export async function GET(request: Request) {
  try {
    // Vercel Cron authentication check
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all publishers with an RSS URL
    const { data: publishers, error: pubError } = await supabaseAdmin
      .from('publishers')
      .select('id, rss_url')
      .not('rss_url', 'is', null);

    if (pubError) {
      throw pubError;
    }

    const results = [];

    // Loop through publishers and re-ingest their feeds
    for (const pub of publishers) {
      if (!pub.rss_url) continue;

      try {
        const items = await ingestRSS(pub.rss_url);
        
        const articlesToInsert = items.map(item => ({
          publisher_id: pub.id,
          title: item.title,
          url: item.url,
          content_fingerprint: item.fingerprint,
          price_usdc: 0.001
        }));

        if (articlesToInsert.length > 0) {
          const { error: articlesError } = await supabaseAdmin
            .from('articles')
            .upsert(articlesToInsert, { onConflict: 'url' });

          if (articlesError) {
            results.push({ publisher_id: pub.id, status: 'error', reason: articlesError.message });
          } else {
            results.push({ publisher_id: pub.id, status: 'success', inserted: articlesToInsert.length });
          }
        } else {
            results.push({ publisher_id: pub.id, status: 'skipped', reason: 'No articles found' });
        }
      } catch (err: any) {
        results.push({ publisher_id: pub.id, status: 'error', reason: err.message });
      }
    }

    return NextResponse.json({ success: true, results }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
