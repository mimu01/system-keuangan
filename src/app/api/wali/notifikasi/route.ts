import { NextRequest, NextResponse } from 'next/server'
import { getCurrentWali } from '@/lib/wali-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const wali = await getCurrentWali()
    if (!wali) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const onlyUnread = searchParams.get('unread') === 'true'

    const where: any = {
      deletedAt: null,
      OR: [{ penerima: 'SEMUA' }, { penerima: 'WALI_MURID' }],
    }
    if (onlyUnread) where.dibaca = false

    const notifikasi = await db.notifikasi.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        judul: true,
        pesan: true,
        tipe: true,
        penerima: true,
        dibaca: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ data: notifikasi })
  } catch (error) {
    console.error('Notifikasi wali error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
