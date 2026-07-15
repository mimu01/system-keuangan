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
    const status = searchParams.get('status') || 'all'

    const where: any = {
      siswaId: wali.siswaId,
      deletedAt: null,
    }
    if (status !== 'all') {
      where.status = status
    }

    const tagihan = await db.tagihan.findMany({
      where,
      orderBy: [{ tanggalJatuhTempo: 'desc' }],
      select: {
        id: true,
        periode: true,
        jumlah: true,
        jumlahDibayar: true,
        tanggalJatuhTempo: true,
        status: true,
        keterangan: true,
        tahunAjaran: { select: { nama: true } },
        jenisPembayaran: { select: { id: true, nama: true, kategori: true, frekuensi: true } },
        pembayaran: {
          where: { deletedAt: null },
          orderBy: { tanggalBayar: 'desc' },
          select: {
            id: true,
            jumlah: true,
            metode: true,
            status: true,
            tanggalBayar: true,
            kodeTransaksi: true,
          },
        },
      },
    })

    return NextResponse.json({ data: tagihan })
  } catch (error) {
    console.error('Tagihan wali error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
