import { NextResponse } from 'next/server'
import { getCurrentWali } from '@/lib/wali-auth'
import { db } from '@/lib/db'
import { formatRupiah } from '@/lib/types'

export async function GET() {
  try {
    const wali = await getCurrentWali()
    if (!wali) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const siswaId = wali.siswaId

    // Ambil semua tagihan anak
    const tagihan = await db.tagihan.findMany({
      where: { siswaId, deletedAt: null },
      select: { jumlah: true, jumlahDibayar: true, status: true },
    })

    const totalTagihan = tagihan.length
    const tagihanLunas = tagihan.filter((t) => t.status === 'LUNAS').length
    const tagihanBelumBayar = tagihan.filter((t) => t.status === 'BELUM_BAYAR').length
    const tagihanSebagian = tagihan.filter((t) => t.status === 'SEBAGIAN').length

    const totalNominalTagihan = tagihan.reduce((s, t) => s + t.jumlah, 0)
    const totalSudahDibayar = tagihan.reduce((s, t) => s + t.jumlahDibayar, 0)
    const totalTunggakan = totalNominalTagihan - totalSudahDibayar

    // Pembayaran terbaru (5)
    const pembayaranRecent = await db.pembayaran.findMany({
      where: { tagihan: { siswaId }, deletedAt: null },
      orderBy: { tanggalBayar: 'desc' },
      take: 5,
      select: {
        id: true,
        kodeTransaksi: true,
        jumlah: true,
        metode: true,
        status: true,
        tanggalBayar: true,
        tagihan: {
          select: {
            jenisPembayaran: { select: { nama: true } },
            periode: true,
          },
        },
      },
    })

    // Tagihan jatuh tempo terdekat (belum lunas, urut jatuh tempo)
    const jatuhTempoTerdekat = await db.tagihan.findMany({
      where: {
        siswaId,
        deletedAt: null,
        status: { in: ['BELUM_BAYAR', 'SEBAGIAN'] },
      },
      orderBy: { tanggalJatuhTempo: 'asc' },
      take: 3,
      select: {
        id: true,
        periode: true,
        jumlah: true,
        jumlahDibayar: true,
        tanggalJatuhTempo: true,
        status: true,
        jenisPembayaran: { select: { nama: true } },
      },
    })

    // Notifikasi belum dibaca
    const notifikasiBelumDibaca = await db.notifikasi.count({
      where: {
        deletedAt: null,
        OR: [{ penerima: 'SEMUA' }, { penerima: 'WALI_MURID' }],
      },
    })

    return NextResponse.json({
      siswa: {
        id: wali.siswa.id,
        nama: wali.siswa.nama,
        nis: wali.siswa.nis,
        kelas: wali.siswa.kelas?.nama ?? '-',
        foto: wali.siswa.foto,
      },
      stats: {
        totalTagihan,
        tagihanLunas,
        tagihanBelumBayar,
        tagihanSebagian,
        totalTunggakan,
        totalSudahDibayar,
        notifikasiBelumDibaca,
      },
      pembayaranRecent,
      jatuhTempoTerdekat,
    })
  } catch (error) {
    console.error('Dashboard wali error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
