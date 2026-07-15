import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const NAMA_BULAN = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Ambil semua data yang dibutuhkan dalam batch parallel (1 round-trip konseptual)
    const [
      totalSiswa,
      pemasukanBulanIniAgg,
      pengeluaranBulanIniAgg,
      pemasukanTotalAgg,
      pengeluaranTotalAgg,
      tagihanStatus,
      pembayaranRecent,
      chartPemasukan,
      chartPengeluaran,
    ] = await Promise.all([
      db.siswa.count({ where: { deletedAt: null } }),
      db.pembayaran.aggregate({
        where: {
          deletedAt: null,
          status: "BERHASIL",
          tanggalBayar: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { jumlah: true },
      }),
      db.pengeluaran.aggregate({
        where: {
          deletedAt: null,
          tanggal: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { jumlah: true },
      }),
      db.pembayaran.aggregate({
        where: { deletedAt: null, status: "BERHASIL" },
        _sum: { jumlah: true },
      }),
      db.pengeluaran.aggregate({
        where: { deletedAt: null },
        _sum: { jumlah: true },
      }),
      db.tagihan.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      db.pembayaran.findMany({
        where: { deletedAt: null, status: "BERHASIL" },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          kodeTransaksi: true,
          jumlah: true,
          metode: true,
          status: true,
          tanggalBayar: true,
          tagihan: {
            select: {
              siswa: { select: { id: true, nama: true } },
            },
          },
        },
      }),
      // Chart: ambil SEMUA pembayaran 6 bulan terakhir dalam 1 query, lalu groupBy di JS
      db.pembayaran.findMany({
        where: {
          deletedAt: null,
          status: "BERHASIL",
          tanggalBayar: {
            gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
          },
        },
        select: { jumlah: true, tanggalBayar: true },
      }),
      db.pengeluaran.findMany({
        where: {
          deletedAt: null,
          tanggal: {
            gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
          },
        },
        select: { jumlah: true, tanggal: true },
      }),
    ]);

    // Group chart data di JS (bukan 12 query terpisah)
    const chartMap: Record<string, { pemasukan: number; pengeluaran: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      chartMap[key] = { pemasukan: 0, pengeluaran: 0 };
    }
    chartPemasukan.forEach((p) => {
      const d = new Date(p.tanggalBayar);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (chartMap[key]) chartMap[key].pemasukan += p.jumlah;
    });
    chartPengeluaran.forEach((p) => {
      const d = new Date(p.tanggal);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (chartMap[key]) chartMap[key].pengeluaran += p.jumlah;
    });
    const chartData = Object.entries(chartMap).map(([key, val]) => {
      const [, monthIdx] = key.split("-");
      return {
        bulan: NAMA_BULAN[parseInt(monthIdx)],
        pemasukan: val.pemasukan,
        pengeluaran: val.pengeluaran,
      };
    });

    const pemasukanBulanIni = pemasukanBulanIniAgg._sum.jumlah ?? 0;
    const pengeluaranBulanIni = pengeluaranBulanIniAgg._sum.jumlah ?? 0;
    const pemasukanTotal = pemasukanTotalAgg._sum.jumlah ?? 0;
    const pengeluaranTotal = pengeluaranTotalAgg._sum.jumlah ?? 0;
    const saldo = pemasukanTotal - pengeluaranTotal;

    const statusMap: Record<string, number> = { LUNAS: 0, BELUM_BAYAR: 0, SEBAGIAN: 0 };
    tagihanStatus.forEach((s) => {
      statusMap[s.status] = s._count._all;
    });

    return NextResponse.json({
      totalSiswa,
      totalPemasukanBulanIni: pemasukanBulanIni,
      totalPengeluaranBulanIni: pengeluaranBulanIni,
      pemasukanTotal,
      pengeluaranTotal,
      saldo,
      tagihanLunas: statusMap.LUNAS,
      tagihanBelumBayar: statusMap.BELUM_BAYAR,
      tagihanSebagian: statusMap.SEBAGIAN,
      totalTagihan:
        statusMap.LUNAS + statusMap.BELUM_BAYAR + statusMap.SEBAGIAN,
      chartData,
      pembayaranRecent: pembayaranRecent.map((p) => ({
        id: p.id,
        kodeTransaksi: p.kodeTransaksi,
        jumlah: p.jumlah,
        metode: p.metode,
        status: p.status,
        tanggalBayar: p.tanggalBayar,
        siswa: p.tagihan?.siswa
          ? { id: p.tagihan.siswa.id, nama: p.tagihan.siswa.nama }
          : null,
      })),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memuat statistik" },
      { status: 500 }
    );
  }
}
