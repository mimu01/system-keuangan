import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

const jenisSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  deskripsi: z.string().optional().nullable(),
  jumlah: z.coerce.number().min(1, "Jumlah harus lebih dari 0"),
  kategori: z.enum(["SPP", "PENGEMBANGAN", "KEGIATAN", "SERAGAM", "BUKU", "LAINNYA"]),
  frekuensi: z.enum(["BULANAN", "TAHUNAN", "SEKALI", "SEMESTER"]).default("BULANAN"),
  tahunAjaranId: z.string().optional().nullable(),
  aktif: z.boolean().default(true),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { id } = await params;
    const jenis = await db.jenisPembayaran.findFirst({
      where: { id, deletedAt: null },
      include: { tahunAjaran: true },
    });
    if (!jenis) {
      return NextResponse.json({ error: "Jenis pembayaran tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(jenis);
  } catch (error) {
    console.error("GET jenis-pembayaran/[id] error:", error);
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
    const parsed = jenisSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const existing = await db.jenisPembayaran.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return NextResponse.json({ error: "Jenis pembayaran tidak ditemukan" }, { status: 404 });
    }
    const jenis = await db.jenisPembayaran.update({
      where: { id },
      data: {
        nama: data.nama,
        deskripsi: data.deskripsi ?? null,
        jumlah: data.jumlah,
        kategori: data.kategori,
        frekuensi: data.frekuensi,
        tahunAjaranId: data.tahunAjaranId || null,
        aktif: data.aktif,
      },
      include: { tahunAjaran: true },
    });
    await logActivity({
      adminId: admin.id,
      aksi: "UPDATE",
      modul: "JENIS_PEMBAYARAN",
      deskripsi: `Mengubah jenis pembayaran ${jenis.nama}`,
      entitasId: jenis.id,
    });
    return NextResponse.json(jenis);
  } catch (error) {
    console.error("PUT jenis-pembayaran/[id] error:", error);
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
    const jenis = await db.jenisPembayaran.findFirst({ where: { id, deletedAt: null } });
    if (!jenis) {
      return NextResponse.json({ error: "Jenis pembayaran tidak ditemukan" }, { status: 404 });
    }
    await db.jenisPembayaran.update({ where: { id }, data: { deletedAt: new Date() } });
    await logActivity({
      adminId: admin.id,
      aksi: "DELETE",
      modul: "JENIS_PEMBAYARAN",
      deskripsi: `Menghapus jenis pembayaran ${jenis.nama}`,
      entitasId: jenis.id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE jenis-pembayaran/[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
