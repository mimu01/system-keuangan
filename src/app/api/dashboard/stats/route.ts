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

    const [
      totalSiswa,
      pemasukanBulanIniAgg,
      pengeluaranBulanIniAgg,
      pemasukanTotalAgg,
      pengeluaranTotalAgg,
      tagihanStatus,
      pembayaranRecent,
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
        include: {
          tagihan: { include: { siswa: true } },
        },
      }),
    ]);

    const pemasukanBulanIni = pemasukanBulanIniAgg._sum.jumlah ?? 0;
    const pengeluaranBulanIni = pengeluaranBulanIniAgg._sum.jumlah ?? 0;
    const pemasukanTotal = pemasukanTotalAgg._sum.jumlah ?? 0;
    const pengeluaranTotal = pengeluaranTotalAgg._sum.jumlah ?? 0;
    const saldo = pemasukanTotal - pengeluaranTotal;

    // Chart data: last 6 months
    const chartData: { bulan: string; pemasukan: number; pengeluaran: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const s = new Date(d.getFullYear(), d.getMonth(), 1);
      const e = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const [pem, peng] = await Promise.all([
        db.pembayaran.aggregate({
          where: {
            deletedAt: null,
            status: "BERHASIL",
            tanggalBayar: { gte: s, lte: e },
          },
          _sum: { jumlah: true },
        }),
        db.pengeluaran.aggregate({
          where: { deletedAt: null, tanggal: { gte: s, lte: e } },
          _sum: { jumlah: true },
        }),
      ]);
      chartData.push({
        bulan: NAMA_BULAN[d.getMonth()],
        pemasukan: pem._sum.jumlah ?? 0,
        pengeluaran: peng._sum.jumlah ?? 0,
      });
    }

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
