export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { runKeryxAgent } from '@/lib/agent'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export async function POST(request: Request) {
  try {
    // Basic IP tracking from headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown_ip'
    
    const now = Date.now()
    const record = rateLimitMap.get(ip)

    if (record) {
      if (now > record.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 }) // 1 hour
      } else if (record.count >= 10) {
        return NextResponse.json(
          { error: 'Rate limit exceeded', retry_after: '1 hour' },
          { status: 429, headers: { 'Retry-After': '3600' } }
        )
      } else {
        record.count += 1
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 })
    }

    const body = await request.json()
    const { question, budget_usdc } = body

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const result = await runKeryxAgent(question, budget_usdc || 0.05)

    return NextResponse.json(result, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
