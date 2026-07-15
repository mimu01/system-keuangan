import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";
import { broadcast, RealtimeEvents } from "@/lib/realtime";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { id } = await params;
    const pembayaran = await db.pembayaran.findFirst({
      where: { id, deletedAt: null },
      include: {
        tagihan: { include: { siswa: true, jenisPembayaran: true } },
        waliMurid: true,
        admin: { select: { id: true, nama: true, email: true } },
      },
    });
    if (!pembayaran) {
      return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(pembayaran);
  } catch (error) {
    console.error("GET pembayaran/[id] error:", error);
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
    const pembayaran = await db.pembayaran.findFirst({
      where: { id, deletedAt: null },
      include: { tagihan: true },
    });
    if (!pembayaran) {
      return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 });
    }

    // Reverse the tagihan amount
    const tagihan = pembayaran.tagihan;
    const newDibayar = Math.max(0, tagihan.jumlahDibayar - pembayaran.jumlah);
    let newStatus = "BELUM_BAYAR";
    if (newDibayar >= tagihan.jumlah) newStatus = "LUNAS";
    else if (newDibayar > 0) newStatus = "SEBAGIAN";

    await db.$transaction([
      db.pembayaran.update({ where: { id }, data: { deletedAt: new Date() } }),
      db.tagihan.update({
        where: { id: tagihan.id },
        data: { jumlahDibayar: newDibayar, status: newStatus },
      }),
    ]);

    await logActivity({
      adminId: admin.id,
      aksi: "DELETE",
      modul: "PEMBAYARAN",
      deskripsi: `Menghapus pembayaran ${pembayaran.kodeTransaksi}`,
      entitasId: pembayaran.id,
    });

    await broadcast(RealtimeEvents.PEMBAYARAN_UPDATED, { id });
    await broadcast(RealtimeEvents.TAGIHAN_UPDATED, { id: tagihan.id });
    await broadcast(RealtimeEvents.DASHBOARD_REFRESH, {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE pembayaran/[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
