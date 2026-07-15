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

export async function GET(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const tahunAjaranId = searchParams.get("tahunAjaranId");

    const where = {
      deletedAt: null,
      ...(search ? { nama: { contains: search } } : {}),
      ...(tahunAjaranId && tahunAjaranId !== "all" ? { tahunAjaranId } : {}),
    };

    const kelasList = await db.kelas.findMany({
      where,
      include: {
        tahunAjaran: true,
        _count: { select: { siswa: { where: { deletedAt: null } } } },
      },
      orderBy: [{ tingkat: "asc" }, { nama: "asc" }],
    });

    return NextResponse.json({ data: kelasList });
  } catch (error) {
    console.error("GET kelas error:", error);
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
    const parsed = kelasSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const kelas = await db.kelas.create({
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
      aksi: "CREATE",
      modul: "KELAS",
      deskripsi: `Menambah kelas ${kelas.nama}`,
      entitasId: kelas.id,
    });
    return NextResponse.json(kelas, { status: 201 });
  } catch (error) {
    console.error("POST kelas error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
