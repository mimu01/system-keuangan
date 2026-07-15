import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

export async function POST() {
  try {
    const admin = await getCurrentAdmin();
    if (admin) {
      await logActivity({
        adminId: admin.id,
        aksi: "LOGOUT",
        modul: "AUTH",
        deskripsi: `${admin.nama} keluar dari sistem`,
      });
    }
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat keluar" },
      { status: 500 }
    );
  }
}
