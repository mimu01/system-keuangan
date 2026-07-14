import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";
import { broadcast, RealtimeEvents } from "@/lib/realtime";

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const generateSchema = z.object({
  jenisPembayaranId: z.string().min(1, "Jenis pembayaran wajib dipilih"),
  tahunAjaranId: z.string().min(1, "Tahun ajaran wajib dipilih"),
  bulan: z.coerce.number().int().min(0).max(11),
  tahun: z.coerce.number().int().min(2020),
  // optional: filter by kelas
  kelasId: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const body = await req.json();
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const jenis = await db.jenisPembayaran.findFirst({
      where: { id: data.jenisPembayaranId, deletedAt: null },
    });
    if (!jenis) {
      return NextResponse.json({ error: "Jenis pembayaran tidak ditemukan" }, { status: 404 });
    }

    const periode = `${data.tahun}-${String(data.bulan + 1).padStart(2, "0")}`;
    const jatuhTempo = new Date(data.tahun, data.bulan + 1, 10); // tanggal 10 bulan berikutnya

    // Get all siswa (filtered by kelas if provided)
    const siswaList = await db.siswa.findMany({
      where: {
        deletedAt: null,
        status: "AKTIF",
        ...(data.kelasId ? { kelasId: data.kelasId } : {}),
      },
      select: { id: true, nama: true },
    });

    if (siswaList.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada siswa aktif yang ditemukan" },
        { status: 400 }
      );
    }

    // Check existing tagihan to avoid duplicates
    const existing = await db.tagihan.findMany({
      where: {
        deletedAt: null,
        jenisPembayaranId: data.jenisPembayaranId,
        periode,
        siswaId: { in: siswaList.map((s) => s.id) },
      },
      select: { siswaId: true },
    });
    const existingSet = new Set(existing.map((e) => e.siswaId));
    const toCreate = siswaList.filter((s) => !existingSet.has(s.id));

    if (toCreate.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Semua tagihan untuk periode ini sudah ada",
        created: 0,
        periode,
      });
    }

    await db.tagihan.createMany({
      data: toCreate.map((s) => ({
        siswaId: s.id,
        jenisPembayaranId: data.jenisPembayaranId,
        tahunAjaranId: data.tahunAjaranId,
        periode,
        jumlah: jenis.jumlah,
        jumlahDibayar: 0,
        status: "BELUM_BAYAR",
        tanggalJatuhTempo: jatuhTempo,
        keterangan: `Tagihan ${jenis.nama} - ${NAMA_BULAN[data.bulan]} ${data.tahun}`,
      })),
    });

    await logActivity({
      adminId: admin.id,
      aksi: "CREATE",
      modul: "TAGIHAN",
      deskripsi: `Generate tagihan massal ${jenis.nama} periode ${periode} (${toCreate.length} siswa)`,
    });

    await broadcast(RealtimeEvents.TAGIHAN_CREATED, { count: toCreate.length, periode });
    await broadcast(RealtimeEvents.DASHBOARD_REFRESH, {});

    return NextResponse.json({
      success: true,
      created: toCreate.length,
      skipped: existingSet.size,
      periode,
      message: `Berhasil membuat ${toCreate.length} tagihan untuk periode ${NAMA_BULAN[data.bulan]} ${data.tahun}`,
    });
  } catch (error) {
    console.error("POST tagihan/generate error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat generate tagihan" }, { status: 500 });
  }
}
