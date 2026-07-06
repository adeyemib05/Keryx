export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Quick probe to verify Supabase connection
    const { error } = await supabase
      .from('publishers')
      .select('id')
      .limit(1);

    const isConnected = !error;

    return NextResponse.json(
      {
        status: 'ok',
        supabase: isConnected ? 'connected' : 'error',
        chain_id: 5042002, // Arc Testnet
        timestamp: new Date().toISOString()
      },
      { status: isConnected ? 200 : 503 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: 'error',
        supabase: 'error',
        chain_id: 5042002,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
