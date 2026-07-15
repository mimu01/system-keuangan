import { NextResponse } from "next/server";
import { z } from "zod";
import { db, verifyPassword } from "@/lib/db";
import {
  createSession,
  setSessionCookie,
} from "@/lib/auth";
import { logActivity } from "@/lib/logger";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const admin = await db.admin.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
        aktif: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Email atau kata sandi salah" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Email atau kata sandi salah" },
        { status: 401 }
      );
    }

    await db.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    const token = await createSession({
      adminId: admin.id,
      email: admin.email,
      nama: admin.nama,
      role: admin.role,
    });

    await setSessionCookie(token);

    await logActivity({
      adminId: admin.id,
      aksi: "LOGIN",
      modul: "AUTH",
      deskripsi: `${admin.nama} berhasil login`,
    });

    return NextResponse.json({
      admin: {
        id: admin.id,
        nama: admin.nama,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat masuk" },
      { status: 500 }
    );
  }
}
