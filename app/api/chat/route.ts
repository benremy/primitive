import { NextRequest, NextResponse } from 'next/server'
import { ask } from '@/lib/ai'

// in-memory store: IP address -> array of request timestamps
// resets on server restart — fine for a lightweight public app
const rateLimitMap = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  // keep only timestamps from the last 60 seconds
  const recent = (rateLimitMap.get(ip) ?? []).filter(t => now - t < 60_000)
  // reject if the IP has hit 10 requests in that window
  if (recent.length >= 10) return true
  rateLimitMap.set(ip, [...recent, now])
  return false
}

export async function POST(req: NextRequest) {
  // kill switch — set CHAT_ENABLED=false in env to shut down without redeploying
  if (process.env.CHAT_ENABLED === 'false')
    return NextResponse.json({ message: 'Chat is currently disabled.' }, { status: 503 })

  // x-forwarded-for is set by the hosting proxy (Vercel, etc.) with the real client IP
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (isRateLimited(ip))
    return NextResponse.json({ message: 'Too many requests. Slow down.' }, { status: 429 })

  try {
    const { message, history } = await req.json()

    // reject empty, non-string, or oversized messages to prevent abuse and token cost spikes
    if (!message || typeof message !== 'string' || message.length > 2000)
      return NextResponse.json({ message: 'Invalid message.' }, { status: 400 })

    // cap history to the last 20 turns — older context isn't worth the token cost
    const reply = await ask(message, (history ?? []).slice(-20))
    return NextResponse.json({ message: reply })
  } catch (e) {
    console.error('chat error:', e)
    return NextResponse.json({ message: 'Error' }, { status: 500 })
  }
}
