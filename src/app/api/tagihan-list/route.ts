import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

// Get simple list of tagihan with remaining amount (for pembayaran dropdown)
export async function GET(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const siswaId = searchParams.get("siswaId");
    const status = searchParams.get("status"); // filter by BELUM_BAYAR / SEBAGIAN

    const where = {
      deletedAt: null,
      ...(siswaId ? { siswaId } : {}),
      ...(status && status !== "all" ? { status } : {}),
    };

    const list = await db.tagihan.findMany({
      where,
      select: {
        id: true,
        periode: true,
        jumlah: true,
        jumlahDibayar: true,
        status: true,
        tanggalJatuhTempo: true,
        siswa: { select: { id: true, nama: true, nis: true } },
        jenisPembayaran: { select: { id: true, nama: true, kategori: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: list });
  } catch (error) {
    console.error("GET tagihan-list error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
