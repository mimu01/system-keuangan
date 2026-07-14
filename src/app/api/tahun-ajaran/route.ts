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

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const list = await db.tahunAjaran.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: list });
  } catch (error) {
    console.error("GET tahun-ajaran error:", error);
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
    const parsed = taSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const dup = await db.tahunAjaran.findFirst({
      where: { nama: data.nama, deletedAt: null },
    });
    if (dup) {
      return NextResponse.json({ error: "Nama tahun ajaran sudah ada" }, { status: 400 });
    }

    // If aktif, deactivate others
    if (data.aktif) {
      await db.tahunAjaran.updateMany({
        where: { aktif: true, deletedAt: null },
        data: { aktif: false },
      });
    }

    const ta = await db.tahunAjaran.create({
      data: {
        nama: data.nama,
        tanggalMulai: new Date(data.tanggalMulai),
        tanggalSelesai: new Date(data.tanggalSelesai),
        aktif: data.aktif,
      },
    });
    await logActivity({
      adminId: admin.id,
      aksi: "CREATE",
      modul: "TAHUN_AJARAN",
      deskripsi: `Menambah tahun ajaran ${ta.nama}`,
      entitasId: ta.id,
    });
    return NextResponse.json(ta, { status: 201 });
  } catch (error) {
    console.error("POST tahun-ajaran error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
