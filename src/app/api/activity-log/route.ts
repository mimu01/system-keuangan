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
    const modul = searchParams.get("modul");
    const aksi = searchParams.get("aksi");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");

    const where = {
      ...(modul && modul !== "all" ? { modul } : {}),
      ...(aksi && aksi !== "all" ? { aksi } : {}),
    };

    const [logs, total] = await Promise.all([
      db.activityLog.findMany({
        where,
        include: {
          admin: {
            select: { id: true, nama: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.activityLog.count({ where }),
    ]);
    return NextResponse.json({ data: logs, total, page, limit });
  } catch (error) {
    console.error("GET activity-log error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
