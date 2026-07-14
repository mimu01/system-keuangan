import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const jenis = searchParams.get("jenis") ?? "SEMUA"; // PEMASUKAN | PENGELUARAN | SEMUA

    const dateFilter = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to + "T23:59:59") } : {}),
    };

    const pembayaranWhere = {
      deletedAt: null,
      status: "BERHASIL",
      ...(from || to ? { tanggalBayar: dateFilter } : {}),
    };
    const pengeluaranWhere = {
      deletedAt: null,
      ...(from || to ? { tanggal: dateFilter } : {}),
    };

    const [pembayaran, pengeluaran, pemAgg, pengAgg] = await Promise.all([
      jenis === "PENGELUARAN"
        ? Promise.resolve([])
        : db.pembayaran.findMany({
            where: pembayaranWhere,
            include: {
              tagihan: { include: { siswa: true, jenisPembayaran: true } },
            },
            orderBy: { tanggalBayar: "desc" },
          }),
      jenis === "PEMASUKAN"
        ? Promise.resolve([])
        : db.pengeluaran.findMany({
            where: pengeluaranWhere,
            include: { admin: { select: { id: true, nama: true } } },
            orderBy: { tanggal: "desc" },
          }),
      db.pembayaran.aggregate({
        where: pembayaranWhere,
        _sum: { jumlah: true },
      }),
      db.pengeluaran.aggregate({
        where: pengeluaranWhere,
        _sum: { jumlah: true },
      }),
    ]);

    const totalPemasukan = pemAgg._sum.jumlah ?? 0;
    const totalPengeluaran = pengAgg._sum.jumlah ?? 0;
    const saldo = totalPemasukan - totalPengeluaran;

    type Tx = {
      id: string;
      tanggal: string;
      tipe: "PEMASUKAN" | "PENGELUARAN";
      kategori: string;
      deskripsi: string;
      jumlah: number;
      ref?: string;
      siswa?: string;
    };

    const transactions: Tx[] = [
      ...pembayaran.map((p) => ({
        id: p.id,
        tanggal: p.tanggalBayar.toISOString(),
        tipe: "PEMASUKAN" as const,
        kategori: p.tagihan?.jenisPembayaran?.kategori ?? "LAINNYA",
        deskripsi: `Pembayaran ${p.tagihan?.jenisPembayaran?.nama ?? ""}`,
        jumlah: p.jumlah,
        ref: p.kodeTransaksi,
        siswa: p.tagihan?.siswa?.nama,
      })),
      ...pengeluaran.map((p) => ({
        id: p.id,
        tanggal: p.tanggal.toISOString(),
        tipe: "PENGELUARAN" as const,
        kategori: p.kategori,
        deskripsi: p.judul,
        jumlah: p.jumlah,
      })),
    ].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

    return NextResponse.json({
      transactions,
      summary: {
        totalPemasukan,
        totalPengeluaran,
        saldo,
      },
    });
  } catch (error) {
    console.error("GET laporan error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
