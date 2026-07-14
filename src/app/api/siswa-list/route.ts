import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

// Get simple list of siswa (for dropdowns)
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const siswa = await db.siswa.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        nis: true,
        nama: true,
        kelasId: true,
        kelas: { select: { nama: true } },
      },
      orderBy: { nama: "asc" },
    });
    return NextResponse.json({ data: siswa });
  } catch (error) {
    console.error("GET siswa-list error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
