export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { GatewayClient } from '@circle-fin/x402-batching/client'
import * as fs from 'fs'
import * as path from 'path'

export async function GET() {
  try {
    let pk = (process.env.BUYER_PRIVATE_KEY || '').trim()
    if (!pk || pk.length < 10) {
      try {
        const envPath = path.join(process.cwd(), '.env.local')
        const envContent = fs.readFileSync(envPath, 'utf8')
        const match = envContent.match(/^BUYER_PRIVATE_KEY=(.*)$/m)
        if (match) pk = match[1].trim()
      } catch { /* ignore */ }
    }
    if (!pk || pk.length < 10) {
      return NextResponse.json({ balance: null }, { status: 200 })
    }

    const client = new GatewayClient({ chain: 'arcTestnet', privateKey: pk as `0x${string}` })
    const balances = await client.getBalances()
    return NextResponse.json({
      balance: balances.gateway.formattedAvailable,
      wallet: balances.wallet.formatted,
    }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ balance: null }, { status: 200 })
  }
}
