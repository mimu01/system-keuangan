import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

// Get simple list of kelas (for dropdowns)
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const kelas = await db.kelas.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        nama: true,
        tingkat: true,
        tahunAjaranId: true,
        waliKelas: true,
      },
      orderBy: [{ tingkat: "asc" }, { nama: "asc" }],
    });
    return NextResponse.json({ data: kelas });
  } catch (error) {
    console.error("GET kelas-list error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
