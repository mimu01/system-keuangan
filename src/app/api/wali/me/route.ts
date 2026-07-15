import { NextResponse } from 'next/server'
import { getCurrentWali } from '@/lib/wali-auth'

export async function GET() {
  const wali = await getCurrentWali()
  if (!wali) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
  }
  return NextResponse.json({ wali })
}
