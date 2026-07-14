import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

const siswaSchema = z.object({
  nis: z.string().min(1, "NIS wajib diisi"),
  nisn: z.string().optional().nullable(),
  nama: z.string().min(1, "Nama wajib diisi"),
  jenisKelamin: z.enum(["L", "P"], { message: "Jenis kelamin tidak valid" }),
  tempatLahir: z.string().optional().nullable(),
  tanggalLahir: z.string().optional().nullable(),
  alamat: z.string().optional().nullable(),
  kelasId: z.string().optional().nullable(),
  tahunAjaranId: z.string().optional().nullable(),
  status: z.enum(["AKTIF", "LULUS", "PINDAH", "NONAKTIF"]).default("AKTIF"),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { id } = await params;
    const siswa = await db.siswa.findFirst({
      where: { id, deletedAt: null },
      include: { kelas: true, tahunAjaran: true, waliMurid: true },
    });
    if (!siswa) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(siswa);
  } catch (error) {
    console.error("GET siswa/[id] error:", error);
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
    const parsed = siswaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const existing = await db.siswa.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    const dup = await db.siswa.findFirst({
      where: { nis: data.nis, deletedAt: null, NOT: { id } },
    });
    if (dup) {
      return NextResponse.json({ error: "NIS sudah terdaftar" }, { status: 400 });
    }

    const siswa = await db.siswa.update({
      where: { id },
      data: {
        nis: data.nis,
        nisn: data.nisn ?? null,
        nama: data.nama,
        jenisKelamin: data.jenisKelamin,
        tempatLahir: data.tempatLahir ?? null,
        tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
        alamat: data.alamat ?? null,
        kelasId: data.kelasId || null,
        tahunAjaranId: data.tahunAjaranId || null,
        status: data.status,
      },
    });

    await logActivity({
      adminId: admin.id,
      aksi: "UPDATE",
      modul: "SISWA",
      deskripsi: `Mengubah data siswa ${siswa.nama} (${siswa.nis})`,
      entitasId: siswa.id,
    });

    return NextResponse.json(siswa);
  } catch (error) {
    console.error("PUT siswa/[id] error:", error);
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
    const siswa = await db.siswa.findFirst({ where: { id, deletedAt: null } });
    if (!siswa) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }
    await db.siswa.update({ where: { id }, data: { deletedAt: new Date() } });
    await logActivity({
      adminId: admin.id,
      aksi: "DELETE",
      modul: "SISWA",
      deskripsi: `Menghapus siswa ${siswa.nama} (${siswa.nis})`,
      entitasId: siswa.id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE siswa/[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
