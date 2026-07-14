import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";
import { broadcast, RealtimeEvents } from "@/lib/realtime";
import { generateKodeTransaksi } from "@/lib/types";

const pembayaranSchema = z.object({
  tagihanId: z.string().min(1, "Tagihan wajib dipilih"),
  waliMuridId: z.string().optional().nullable(),
  jumlah: z.coerce.number().min(1, "Jumlah harus lebih dari 0"),
  metode: z.enum(["TUNAI", "TRANSFER", "QRISS", "EWALLET"]),
  tanggalBayar: z.string().optional(),
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
    const metode = searchParams.get("metode");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");

    const where = {
      deletedAt: null,
      ...(status && status !== "all" ? { status } : {}),
      ...(metode && metode !== "all" ? { metode } : {}),
      ...(from || to
        ? {
            tanggalBayar: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to + "T23:59:59") } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { kodeTransaksi: { contains: search } },
              { tagihan: { siswa: { nama: { contains: search } } } },
              { tagihan: { siswa: { nis: { contains: search } } } },
            ],
          }
        : {}),
    };

    const [pembayaran, total] = await Promise.all([
      db.pembayaran.findMany({
        where,
        include: {
          tagihan: { include: { siswa: true, jenisPembayaran: true } },
          waliMurid: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.pembayaran.count({ where }),
    ]);

    return NextResponse.json({ data: pembayaran, total, page, limit });
  } catch (error) {
    console.error("GET pembayaran error:", error);
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
    const parsed = pembayaranSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const tagihan = await db.tagihan.findFirst({
      where: { id: data.tagihanId, deletedAt: null },
      include: { siswa: true, jenisPembayaran: true },
    });
    if (!tagihan) {
      return NextResponse.json({ error: "Tagihan tidak ditemukan" }, { status: 404 });
    }

    const sisaTagihan = tagihan.jumlah - tagihan.jumlahDibayar;
    if (data.jumlah > sisaTagihan + 1) {
      return NextResponse.json(
        { error: `Jumlah melebihi sisa tagihan (maks ${sisaTagihan})` },
        { status: 400 }
      );
    }

    // Create pembayaran
    const pembayaran = await db.pembayaran.create({
      data: {
        tagihanId: data.tagihanId,
        waliMuridId: data.waliMuridId || null,
        diterimaOleh: admin.id,
        jumlah: data.jumlah,
        metode: data.metode,
        tanggalBayar: data.tanggalBayar ? new Date(data.tanggalBayar) : new Date(),
        status: "BERHASIL",
        keterangan: data.keterangan ?? null,
        kodeTransaksi: generateKodeTransaksi(),
      },
      include: {
        tagihan: { include: { siswa: true, jenisPembayaran: true } },
      },
    });

    // Update tagihan
    const newDibayar = tagihan.jumlahDibayar + data.jumlah;
    let newStatus: string = "BELUM_BAYAR";
    if (newDibayar >= tagihan.jumlah) newStatus = "LUNAS";
    else if (newDibayar > 0) newStatus = "SEBAGIAN";

    await db.tagihan.update({
      where: { id: tagihan.id },
      data: { jumlahDibayar: newDibayar, status: newStatus },
    });

    await logActivity({
      adminId: admin.id,
      aksi: "CREATE",
      modul: "PEMBAYARAN",
      deskripsi: `Menerima pembayaran ${pembayaran.kodeTransaksi} dari ${tagihan.siswa.nama} sebesar ${data.jumlah}`,
      entitasId: pembayaran.id,
    });

    await broadcast(RealtimeEvents.PEMBAYARAN_CREATED, {
      id: pembayaran.id,
      kodeTransaksi: pembayaran.kodeTransaksi,
      siswa: tagihan.siswa.nama,
      jumlah: data.jumlah,
      status: "BERHASIL",
    });
    await broadcast(RealtimeEvents.TAGIHAN_UPDATED, { id: tagihan.id });
    await broadcast(RealtimeEvents.DASHBOARD_REFRESH, {});

    return NextResponse.json(pembayaran, { status: 201 });
  } catch (error) {
    console.error("POST pembayaran error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
