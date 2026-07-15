import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

const waliSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  noHp: z.string().optional().nullable(),
  alamat: z.string().optional().nullable(),
  pekerjaan: z.string().optional().nullable(),
  hubungan: z.string().min(1, "Hubungan wajib diisi").default("Orang Tua"),
  siswaId: z.string().min(1, "Siswa wajib dipilih"),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { id } = await params;
    const wali = await db.waliMurid.findFirst({
      where: { id, deletedAt: null },
      include: { siswa: true },
    });
    if (!wali) {
      return NextResponse.json({ error: "Wali murid tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(wali);
  } catch (error) {
    console.error("GET wali-murid/[id] error:", error);
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
    const parsed = waliSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const existing = await db.waliMurid.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return NextResponse.json({ error: "Wali murid tidak ditemukan" }, { status: 404 });
    }
    const dup = await db.waliMurid.findFirst({
      where: { email: data.email.toLowerCase(), deletedAt: null, NOT: { id } },
    });
    if (dup) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }
    const dupSiswa = await db.waliMurid.findFirst({
      where: { siswaId: data.siswaId, deletedAt: null, NOT: { id } },
    });
    if (dupSiswa) {
      return NextResponse.json({ error: "Siswa ini sudah memiliki wali murid" }, { status: 400 });
    }

    const wali = await db.waliMurid.update({
      where: { id },
      data: {
        nama: data.nama,
        email: data.email.toLowerCase(),
        noHp: data.noHp ?? null,
        alamat: data.alamat ?? null,
        pekerjaan: data.pekerjaan ?? null,
        hubungan: data.hubungan,
        siswaId: data.siswaId,
      },
      include: { siswa: true },
    });
    await logActivity({
      adminId: admin.id,
      aksi: "UPDATE",
      modul: "WALI_MURID",
      deskripsi: `Mengubah wali murid ${wali.nama}`,
      entitasId: wali.id,
    });
    return NextResponse.json(wali);
  } catch (error) {
    console.error("PUT wali-murid/[id] error:", error);
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
    const wali = await db.waliMurid.findFirst({ where: { id, deletedAt: null } });
    if (!wali) {
      return NextResponse.json({ error: "Wali murid tidak ditemukan" }, { status: 404 });
    }
    await db.waliMurid.update({ where: { id }, data: { deletedAt: new Date() } });
    await logActivity({
      adminId: admin.id,
      aksi: "DELETE",
      modul: "WALI_MURID",
      deskripsi: `Menghapus wali murid ${wali.nama}`,
      entitasId: wali.id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE wali-murid/[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
