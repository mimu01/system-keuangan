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
  jumlahDibayar: z.coerce.number().min(0).optional().default(0),
  status: z.enum(["BELUM_BAYAR", "SEBAGIAN", "LUNAS"]).optional(),
  tanggalJatuhTempo: z.string().min(1, "Tanggal jatuh tempo wajib diisi"),
  keterangan: z.string().optional().nullable(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { id } = await params;
    const tagihan = await db.tagihan.findFirst({
      where: { id, deletedAt: null },
      include: {
        siswa: true,
        jenisPembayaran: true,
        tahunAjaran: true,
        pembayaran: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!tagihan) {
      return NextResponse.json({ error: "Tagihan tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(tagihan);
  } catch (error) {
    console.error("GET tagihan/[id] error:", error);
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
    const parsed = tagihanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const existing = await db.tagihan.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return NextResponse.json({ error: "Tagihan tidak ditemukan" }, { status: 404 });
    }

    const jumlahDibayar = data.jumlahDibayar ?? 0;
    let status = data.status;
    if (!status) {
      if (jumlahDibayar <= 0) status = "BELUM_BAYAR";
      else if (jumlahDibayar >= data.jumlah) status = "LUNAS";
      else status = "SEBAGIAN";
    }

    const tagihan = await db.tagihan.update({
      where: { id },
      data: {
        siswaId: data.siswaId,
        jenisPembayaranId: data.jenisPembayaranId,
        tahunAjaranId: data.tahunAjaranId,
        periode: data.periode,
        jumlah: data.jumlah,
        jumlahDibayar,
        status,
        tanggalJatuhTempo: new Date(data.tanggalJatuhTempo),
        keterangan: data.keterangan ?? null,
      },
      include: { siswa: true, jenisPembayaran: true, tahunAjaran: true },
    });
    await logActivity({
      adminId: admin.id,
      aksi: "UPDATE",
      modul: "TAGIHAN",
      deskripsi: `Mengubah tagihan ${tagihan.periode} untuk ${tagihan.siswa.nama}`,
      entitasId: tagihan.id,
    });
    await broadcast(RealtimeEvents.TAGIHAN_UPDATED, { id: tagihan.id });
    await broadcast(RealtimeEvents.DASHBOARD_REFRESH, {});
    return NextResponse.json(tagihan);
  } catch (error) {
    console.error("PUT tagihan/[id] error:", error);
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
    const tagihan = await db.tagihan.findFirst({ where: { id, deletedAt: null } });
    if (!tagihan) {
      return NextResponse.json({ error: "Tagihan tidak ditemukan" }, { status: 404 });
    }
    await db.tagihan.update({ where: { id }, data: { deletedAt: new Date() } });
    await logActivity({
      adminId: admin.id,
      aksi: "DELETE",
      modul: "TAGIHAN",
      deskripsi: `Menghapus tagihan ${tagihan.periode}`,
      entitasId: tagihan.id,
    });
    await broadcast(RealtimeEvents.TAGIHAN_UPDATED, { id });
    await broadcast(RealtimeEvents.DASHBOARD_REFRESH, {});
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE tagihan/[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
