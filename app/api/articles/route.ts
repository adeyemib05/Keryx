export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const publisher_id = searchParams.get('publisher_id')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const search = searchParams.get('search')

    let query = supabaseAdmin
      .from('articles')
      .select('*, publishers(name, slug, wallet_address)')

    if (publisher_id) {
      query = query.eq('publisher_id', publisher_id)
    }

    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    const { data: articles, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({ articles, count: articles?.length || 0 }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
