import { NextResponse } from 'next/server'
import { clearWaliSessionCookie } from '@/lib/wali-auth'

export async function POST() {
  await clearWaliSessionCookie()
  return NextResponse.json({ success: true })
}
