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

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    const { id } = await params;
    const pengeluaran = await db.pengeluaran.findFirst({
      where: { id, deletedAt: null },
      include: { admin: { select: { id: true, nama: true } } },
    });
    if (!pengeluaran) {
      return NextResponse.json({ error: "Pengeluaran tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(pengeluaran);
  } catch (error) {
    console.error("GET pengeluaran/[id] error:", error);
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
    const parsed = pengeluaranSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const existing = await db.pengeluaran.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return NextResponse.json({ error: "Pengeluaran tidak ditemukan" }, { status: 404 });
    }
    const pengeluaran = await db.pengeluaran.update({
      where: { id },
      data: {
        judul: data.judul,
        deskripsi: data.deskripsi ?? null,
        jumlah: data.jumlah,
        kategori: data.kategori,
        tanggal: data.tanggal ? new Date(data.tanggal) : existing.tanggal,
        bukti: data.bukti ?? null,
      },
      include: { admin: { select: { id: true, nama: true } } },
    });
    await logActivity({
      adminId: admin.id,
      aksi: "UPDATE",
      modul: "PENGELUARAN",
      deskripsi: `Mengubah pengeluaran ${pengeluaran.judul}`,
      entitasId: pengeluaran.id,
    });
    await broadcast(RealtimeEvents.PENGELUARAN_CREATED, { id: pengeluaran.id });
    await broadcast(RealtimeEvents.DASHBOARD_REFRESH, {});
    return NextResponse.json(pengeluaran);
  } catch (error) {
    console.error("PUT pengeluaran/[id] error:", error);
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
    const pengeluaran = await db.pengeluaran.findFirst({ where: { id, deletedAt: null } });
    if (!pengeluaran) {
      return NextResponse.json({ error: "Pengeluaran tidak ditemukan" }, { status: 404 });
    }
    await db.pengeluaran.update({ where: { id }, data: { deletedAt: new Date() } });
    await logActivity({
      adminId: admin.id,
      aksi: "DELETE",
      modul: "PENGELUARAN",
      deskripsi: `Menghapus pengeluaran ${pengeluaran.judul}`,
      entitasId: pengeluaran.id,
    });
    await broadcast(RealtimeEvents.DASHBOARD_REFRESH, {});
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE pengeluaran/[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
