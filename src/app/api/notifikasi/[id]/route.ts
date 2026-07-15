import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { id } = await params;
    const notif = await db.notifikasi.findFirst({ where: { id, deletedAt: null } });
    if (!notif) {
      return NextResponse.json({ error: "Notifikasi tidak ditemukan" }, { status: 404 });
    }
    await db.notifikasi.update({ where: { id }, data: { deletedAt: new Date() } });
    await logActivity({
      adminId: admin.id,
      aksi: "DELETE",
      modul: "NOTIFIKASI",
      deskripsi: `Menghapus notifikasi "${notif.judul}"`,
      entitasId: notif.id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE notifikasi/[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
