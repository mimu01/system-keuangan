import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

const kelasSchema = z.object({
  nama: z.string().min(1, "Nama kelas wajib diisi"),
  tingkat: z.coerce.number().int().min(1, "Tingkat minimal 1").max(6, "Tingkat maksimal 6"),
  tahunAjaranId: z.string().min(1, "Tahun ajaran wajib dipilih"),
  waliKelas: z.string().optional().nullable(),
  kapasitas: z.coerce.number().int().min(1, "Kapasitas minimal 1").default(30),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { id } = await params;
    const kelas = await db.kelas.findFirst({
      where: { id, deletedAt: null },
      include: { tahunAjaran: true, _count: { select: { siswa: { where: { deletedAt: null } } } } },
    });
    if (!kelas) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(kelas);
  } catch (error) {
    console.error("GET kelas/[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();
    const parsed = kelasSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const existing = await db.kelas.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }
    const kelas = await db.kelas.update({
      where: { id },
      data: {
        nama: data.nama,
        tingkat: data.tingkat,
        tahunAjaranId: data.tahunAjaranId,
        waliKelas: data.waliKelas ?? null,
        kapasitas: data.kapasitas,
      },
      include: { tahunAjaran: true },
    });
    await logActivity({
      adminId: admin.id,
      aksi: "UPDATE",
      modul: "KELAS",
      deskripsi: `Mengubah kelas ${kelas.nama}`,
      entitasId: kelas.id,
    });
    return NextResponse.json(kelas);
  } catch (error) {
    console.error("PUT kelas/[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { id } = await params;
    const kelas = await db.kelas.findFirst({ where: { id, deletedAt: null } });
    if (!kelas) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }
    await db.kelas.update({ where: { id }, data: { deletedAt: new Date() } });
    await logActivity({
      adminId: admin.id,
      aksi: "DELETE",
      modul: "KELAS",
      deskripsi: `Menghapus kelas ${kelas.nama}`,
      entitasId: kelas.id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE kelas/[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
