import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";
import { broadcast, RealtimeEvents } from "@/lib/realtime";

const notifSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  pesan: z.string().min(1, "Pesan wajib diisi"),
  tipe: z.enum(["TAGIHAN_BARU", "PEMBAYARAN_BERHASIL", "PENGUMUMAN", "JATUH_TEMPO"]),
  penerima: z.enum(["SEMUA", "WALI_MURID", "ADMIN"]).default("SEMUA"),
});

export async function GET(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const tipe = searchParams.get("tipe");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");

    const where = {
      deletedAt: null,
      ...(tipe && tipe !== "all" ? { tipe } : {}),
    };

    const [notif, total] = await Promise.all([
      db.notifikasi.findMany({
        where,
        include: { admin: { select: { id: true, nama: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.notifikasi.count({ where }),
    ]);
    return NextResponse.json({ data: notif, total, page, limit });
  } catch (error) {
    console.error("GET notifikasi error:", error);
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
    const parsed = notifSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const notif = await db.notifikasi.create({
      data: {
        judul: data.judul,
        pesan: data.pesan,
        tipe: data.tipe,
        penerima: data.penerima,
        dibuatOleh: admin.id,
      },
      include: { admin: { select: { id: true, nama: true } } },
    });

    await logActivity({
      adminId: admin.id,
      aksi: "CREATE",
      modul: "NOTIFIKASI",
      deskripsi: `Mengirim notifikasi "${notif.judul}" ke ${notif.penerima}`,
      entitasId: notif.id,
    });

    await broadcast(RealtimeEvents.NOTIFIKASI_NEW, {
      id: notif.id,
      judul: notif.judul,
      tipe: notif.tipe,
      penerima: notif.penerima,
    });

    return NextResponse.json(notif, { status: 201 });
  } catch (error) {
    console.error("POST notifikasi error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
