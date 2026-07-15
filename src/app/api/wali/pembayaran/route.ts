import { NextResponse } from 'next/server'
import { getCurrentWali } from '@/lib/wali-auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const wali = await getCurrentWali()
    if (!wali) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const pembayaran = await db.pembayaran.findMany({
      where: {
        tagihan: { siswaId: wali.siswaId },
        deletedAt: null,
      },
      orderBy: { tanggalBayar: 'desc' },
      select: {
        id: true,
        kodeTransaksi: true,
        jumlah: true,
        metode: true,
        status: true,
        tanggalBayar: true,
        keterangan: true,
        buktiPembayaran: true,
        tagihan: {
          select: {
            id: true,
            periode: true,
            jenisPembayaran: { select: { nama: true, kategori: true } },
          },
        },
      },
    })

    return NextResponse.json({ data: pembayaran })
  } catch (error) {
    console.error('Pembayaran wali error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
