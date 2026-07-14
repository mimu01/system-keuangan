import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

// Get simple list of jenis pembayaran (for dropdowns)
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const list = await db.jenisPembayaran.findMany({
      where: { deletedAt: null, aktif: true },
      select: {
        id: true,
        nama: true,
        jumlah: true,
        kategori: true,
        frekuensi: true,
        tahunAjaranId: true,
      },
      orderBy: { nama: "asc" },
    });
    return NextResponse.json({ data: list });
  } catch (error) {
    console.error("GET jenis-pembayaran-list error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
