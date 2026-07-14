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

export async function GET(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");

    const where = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { nama: { contains: search } },
              { email: { contains: search } },
              { noHp: { contains: search } },
            ],
          }
        : {}),
    };

    const [wali, total] = await Promise.all([
      db.waliMurid.findMany({
        where,
        include: { siswa: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.waliMurid.count({ where }),
    ]);

    return NextResponse.json({ data: wali, total, page, limit });
  } catch (error) {
    console.error("GET wali-murid error:", error);
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
    const parsed = waliSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const existing = await db.waliMurid.findFirst({
      where: { email: data.email.toLowerCase(), deletedAt: null },
    });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }
    const siswaExists = await db.waliMurid.findFirst({
      where: { siswaId: data.siswaId, deletedAt: null },
    });
    if (siswaExists) {
      return NextResponse.json({ error: "Siswa ini sudah memiliki wali murid" }, { status: 400 });
    }

    const wali = await db.waliMurid.create({
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
      aksi: "CREATE",
      modul: "WALI_MURID",
      deskripsi: `Menambah wali murid ${wali.nama}`,
      entitasId: wali.id,
    });

    return NextResponse.json(wali, { status: 201 });
  } catch (error) {
    console.error("POST wali-murid error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
