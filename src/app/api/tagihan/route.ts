import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";
import { broadcast, RealtimeEvents } from "@/lib/realtime";

const tagihanSchema = z.object({
  siswaId: z.string().min(1, "Siswa wajib dipilih"),
  jenisPembayaranId: z.string().min(1, "Jenis pembayaran wajib dipilih"),
  tahunAjaranId: z.string().min(1, "Tahun ajaran wajib dipilih"),
  periode: z.string().min(1, "Periode wajib diisi"),
  jumlah: z.coerce.number().min(1, "Jumlah harus lebih dari 0"),
  tanggalJatuhTempo: z.string().min(1, "Tanggal jatuh tempo wajib diisi"),
  keterangan: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status");
    const siswaId = searchParams.get("siswaId");
    const jenisPembayaranId = searchParams.get("jenisPembayaranId");
    const tahunAjaranId = searchParams.get("tahunAjaranId");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");

    const where = {
      deletedAt: null,
      ...(status && status !== "all" ? { status } : {}),
      ...(siswaId && siswaId !== "all" ? { siswaId } : {}),
      ...(jenisPembayaranId && jenisPembayaranId !== "all" ? { jenisPembayaranId } : {}),
      ...(tahunAjaranId && tahunAjaranId !== "all" ? { tahunAjaranId } : {}),
      ...(search
        ? {
            OR: [
              { siswa: { nama: { contains: search } } },
              { siswa: { nis: { contains: search } } },
              { periode: { contains: search } },
            ],
          }
        : {}),
    };

    const [tagihan, total] = await Promise.all([
      db.tagihan.findMany({
        where,
        include: {
          siswa: true,
          jenisPembayaran: true,
          tahunAjaran: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.tagihan.count({ where }),
    ]);

    return NextResponse.json({ data: tagihan, total, page, limit });
  } catch (error) {
    console.error("GET tagihan error:", error);
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
    const parsed = tagihanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const tagihan = await db.tagihan.create({
      data: {
        siswaId: data.siswaId,
        jenisPembayaranId: data.jenisPembayaranId,
        tahunAjaranId: data.tahunAjaranId,
        periode: data.periode,
        jumlah: data.jumlah,
        jumlahDibayar: 0,
        status: "BELUM_BAYAR",
        tanggalJatuhTempo: new Date(data.tanggalJatuhTempo),
        keterangan: data.keterangan ?? null,
      },
      include: { siswa: true, jenisPembayaran: true, tahunAjaran: true },
    });

    await logActivity({
      adminId: admin.id,
      aksi: "CREATE",
      modul: "TAGIHAN",
      deskripsi: `Menambah tagihan ${tagihan.periode} untuk ${tagihan.siswa.nama}`,
      entitasId: tagihan.id,
    });

    await broadcast(RealtimeEvents.TAGIHAN_CREATED, { id: tagihan.id });
    await broadcast(RealtimeEvents.DASHBOARD_REFRESH, {});

    return NextResponse.json(tagihan, { status: 201 });
  } catch (error) {
    console.error("POST tagihan error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
