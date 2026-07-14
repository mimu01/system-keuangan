import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";
import { broadcast, RealtimeEvents } from "@/lib/realtime";

const pengeluaranSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  deskripsi: z.string().optional().nullable(),
  jumlah: z.coerce.number().min(1, "Jumlah harus lebih dari 0"),
  kategori: z.enum(["OPERASIONAL", "GAJI", "PEMBELIAN", "PEMELIHARAAN", "LAINNYA"]),
  tanggal: z.string().optional(),
  bukti: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const kategori = searchParams.get("kategori");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");

    const where = {
      deletedAt: null,
      ...(kategori && kategori !== "all" ? { kategori } : {}),
      ...(from || to
        ? {
            tanggal: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to + "T23:59:59") } : {}),
            },
          }
        : {}),
      ...(search ? { judul: { contains: search } } : {}),
    };

    const [pengeluaran, total] = await Promise.all([
      db.pengeluaran.findMany({
        where,
        include: { admin: { select: { id: true, nama: true } } },
        orderBy: { tanggal: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.pengeluaran.count({ where }),
    ]);

    return NextResponse.json({ data: pengeluaran, total, page, limit });
  } catch (error) {
    console.error("GET pengeluaran error:", error);
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
    const parsed = pengeluaranSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const pengeluaran = await db.pengeluaran.create({
      data: {
        judul: data.judul,
        deskripsi: data.deskripsi ?? null,
        jumlah: data.jumlah,
        kategori: data.kategori,
        tanggal: data.tanggal ? new Date(data.tanggal) : new Date(),
        bukti: data.bukti ?? null,
        dibuatOleh: admin.id,
      },
      include: { admin: { select: { id: true, nama: true } } },
    });

    await logActivity({
      adminId: admin.id,
      aksi: "CREATE",
      modul: "PENGELUARAN",
      deskripsi: `Menambah pengeluaran ${pengeluaran.judul} sebesar ${pengeluaran.jumlah}`,
      entitasId: pengeluaran.id,
    });

    await broadcast(RealtimeEvents.PENGELUARAN_CREATED, {
      id: pengeluaran.id,
      judul: pengeluaran.judul,
      jumlah: pengeluaran.jumlah,
    });
    await broadcast(RealtimeEvents.DASHBOARD_REFRESH, {});

    return NextResponse.json(pengeluaran, { status: 201 });
  } catch (error) {
    console.error("POST pengeluaran error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
