import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

const taSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  tanggalMulai: z.string().min(1, "Tanggal mulai wajib diisi"),
  tanggalSelesai: z.string().min(1, "Tanggal selesai wajib diisi"),
  aktif: z.boolean().default(false),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { id } = await params;
    const ta = await db.tahunAjaran.findFirst({ where: { id, deletedAt: null } });
    if (!ta) {
      return NextResponse.json({ error: "Tahun ajaran tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(ta);
  } catch (error) {
    console.error("GET tahun-ajaran/[id] error:", error);
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
    const parsed = taSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const existing = await db.tahunAjaran.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return NextResponse.json({ error: "Tahun ajaran tidak ditemukan" }, { status: 404 });
    }
    const dup = await db.tahunAjaran.findFirst({
      where: { nama: data.nama, deletedAt: null, NOT: { id } },
    });
    if (dup) {
      return NextResponse.json({ error: "Nama tahun ajaran sudah ada" }, { status: 400 });
    }
    if (data.aktif) {
      await db.tahunAjaran.updateMany({
        where: { aktif: true, deletedAt: null, NOT: { id } },
        data: { aktif: false },
      });
    }
    const ta = await db.tahunAjaran.update({
      where: { id },
      data: {
        nama: data.nama,
        tanggalMulai: new Date(data.tanggalMulai),
        tanggalSelesai: new Date(data.tanggalSelesai),
        aktif: data.aktif,
      },
    });
    await logActivity({
      adminId: admin.id,
      aksi: "UPDATE",
      modul: "TAHUN_AJARAN",
      deskripsi: `Mengubah tahun ajaran ${ta.nama}`,
      entitasId: ta.id,
    });
    return NextResponse.json(ta);
  } catch (error) {
    console.error("PUT tahun-ajaran/[id] error:", error);
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
    const ta = await db.tahunAjaran.findFirst({ where: { id, deletedAt: null } });
    if (!ta) {
      return NextResponse.json({ error: "Tahun ajaran tidak ditemukan" }, { status: 404 });
    }
    if (ta.aktif) {
      return NextResponse.json({ error: "Tidak dapat menghapus tahun ajaran yang aktif" }, { status: 400 });
    }
    await db.tahunAjaran.update({ where: { id }, data: { deletedAt: new Date() } });
    await logActivity({
      adminId: admin.id,
      aksi: "DELETE",
      modul: "TAHUN_AJARAN",
      deskripsi: `Menghapus tahun ajaran ${ta.nama}`,
      entitasId: ta.id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE tahun-ajaran/[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
