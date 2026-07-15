import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

// Get simple list of tahun ajaran (for dropdowns)
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const list = await db.tahunAjaran.findMany({
      where: { deletedAt: null },
      select: { id: true, nama: true, aktif: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: list });
  } catch (error) {
    console.error("GET tahun-ajaran-list error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
