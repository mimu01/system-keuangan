import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { db, hashPassword, verifyPassword } from "@/lib/db";
import { logActivity } from "@/lib/logger";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
  newPassword: z
    .string()
    .min(6, "Kata sandi baru minimal 6 karakter"),
});

export async function POST(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const adminFull = await db.admin.findFirst({
      where: { id: admin.id, deletedAt: null },
    });
    if (!adminFull) {
      return NextResponse.json(
        { error: "Admin tidak ditemukan" },
        { status: 404 }
      );
    }

    const valid = await verifyPassword(currentPassword, adminFull.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Kata sandi saat ini salah" },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(newPassword);
    await db.admin.update({
      where: { id: admin.id },
      data: { passwordHash: newHash },
    });

    await logActivity({
      adminId: admin.id,
      aksi: "UPDATE",
      modul: "AUTH",
      deskripsi: "Mengganti kata sandi",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengganti kata sandi" },
      { status: 500 }
    );
  }
}
