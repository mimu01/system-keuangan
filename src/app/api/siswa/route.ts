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

export async function GET(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const kelasId = searchParams.get("kelasId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");

    const where = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { nama: { contains: search } },
              { nis: { contains: search } },
              { nisn: { contains: search } },
            ],
          }
        : {}),
      ...(kelasId && kelasId !== "all" ? { kelasId } : {}),
      ...(status && status !== "all" ? { status } : {}),
    };

    const [siswa, total] = await Promise.all([
      db.siswa.findMany({
        where,
        include: {
          kelas: true,
          tahunAjaran: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.siswa.count({ where }),
    ]);

    return NextResponse.json({ data: siswa, total, page, limit });
  } catch (error) {
    console.error("GET siswa error:", error);
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
    const parsed = siswaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const existing = await db.siswa.findFirst({
      where: { nis: data.nis, deletedAt: null },
    });
    if (existing) {
      return NextResponse.json({ error: "NIS sudah terdaftar" }, { status: 400 });
    }

    const siswa = await db.siswa.create({
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
      aksi: "CREATE",
      modul: "SISWA",
      deskripsi: `Menambah siswa ${siswa.nama} (${siswa.nis})`,
      entitasId: siswa.id,
    });

    return NextResponse.json(siswa, { status: 201 });
  } catch (error) {
    console.error("POST siswa error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
