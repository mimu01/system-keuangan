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

export async function GET(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const kategori = searchParams.get("kategori");

    const where = {
      deletedAt: null,
      ...(search ? { nama: { contains: search } } : {}),
      ...(kategori && kategori !== "all" ? { kategori } : {}),
    };

    const jenisList = await db.jenisPembayaran.findMany({
      where,
      include: { tahunAjaran: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: jenisList });
  } catch (error) {
    console.error("GET jenis-pembayaran error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const body = await req.json();
    const parsed = jenisSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const jenis = await db.jenisPembayaran.create({
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
      aksi: "CREATE",
      modul: "JENIS_PEMBAYARAN",
      deskripsi: `Menambah jenis pembayaran ${jenis.nama}`,
      entitasId: jenis.id,
    });
    return NextResponse.json(jenis, { status: 201 });
  } catch (error) {
    console.error("POST jenis-pembayaran error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
