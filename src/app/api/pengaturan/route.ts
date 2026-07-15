import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const settings = await db.pengaturan.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => (map[s.key] = s.value));
    return NextResponse.json(map);
  } catch (error) {
    console.error("GET pengaturan error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

const pengaturanSchema = z.object({
  nama_sekolah: z.string().optional(),
  alamat: z.string().optional(),
  telepon: z.string().optional(),
  email: z.string().optional(),
  kepala_sekolah: z.string().optional(),
  nis: z.string().optional(),
  npsn: z.string().optional(),
  website: z.string().optional(),
});

export async function PUT(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const body = await req.json();
    const parsed = pengaturanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      const existing = await db.pengaturan.findFirst({ where: { key } });
      if (existing) {
        await db.pengaturan.update({ where: { id: existing.id }, data: { value: String(value) } });
      } else {
        await db.pengaturan.create({ data: { key, value: String(value) } });
      }
    }

    await logActivity({
      adminId: admin.id,
      aksi: "UPDATE",
      modul: "PENGATURAN",
      deskripsi: "Mengubah pengaturan sekolah",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT pengaturan error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
