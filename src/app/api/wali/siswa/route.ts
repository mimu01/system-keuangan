import { NextResponse } from 'next/server'
import { getCurrentWali } from '@/lib/wali-auth'

export async function GET() {
  const wali = await getCurrentWali()
  if (!wali) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
  }
  // Data siswa sudah ikut di getCurrentWali (include siswa)
  return NextResponse.json({ siswa: wali.siswa, wali })
}
