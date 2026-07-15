"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  GraduationCap,
  Plus,
  ReceiptText,
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  CalendarClock,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/admin/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  formatRupiah,
  formatTanggalSingkat,
  LABEL_METODE,
  LABEL_STATUS_TAGIHAN,
} from "@/lib/types";

interface DashboardStatsResponse {
  totalSiswa: number;
  totalPemasukanBulanIni: number;
  totalPengeluaranBulanIni: number;
  pemasukanTotal: number;
  pengeluaranTotal: number;
  saldo: number;
  tagihanLunas: number;
  tagihanBelumBayar: number;
  tagihanSebagian: number;
  totalTagihan: number;
  chartData: { bulan: string; pemasukan: number; pengeluaran: number }[];
  pembayaranRecent: {
    id: string;
    kodeTransaksi: string;
    jumlah: number;
    metode: string;
    status: string;
    tanggalBayar: string;
    siswa: { id: string; nama: string } | null;
  }[];
}

const PIE_COLORS = ["#10b981", "#f43f5e", "#f59e0b"];

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardStatsResponse>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Gagal memuat statistik");
      return res.json();
    },
  });

  const pieData = data
    ? [
        { name: LABEL_STATUS_TAGIHAN.LUNAS, value: data.tagihanLunas },
        { name: LABEL_STATUS_TAGIHAN.BELUM_BAYAR, value: data.tagihanBelumBayar },
        { name: LABEL_STATUS_TAGIHAN.SEBAGIAN, value: data.tagihanSebagian },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
            Selamat Datang, Admin 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan keuangan MI Miftahul Ulum 01 hari ini.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/dashboard/pembayaran">
              <Plus className="mr-1.5 size-4" />
              Pembayaran
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/dashboard/tagihan">
              <ReceiptText className="mr-1.5 size-4" />
              Buat Tagihan
            </Link>
          </Button>
          <Button asChild size="sm" className="gradient-emerald text-white">
            <Link href="/admin/dashboard/pengeluaran">
              <Plus className="mr-1.5 size-4" />
              Pengeluaran
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              title="Total Siswa"
              value={data?.totalSiswa ?? 0}
              icon={<GraduationCap className="size-5" />}
              iconClassName="bg-primary/10 text-primary ring-primary/20"
              delay={0}
              description="Siswa aktif terdaftar"
            />
            <StatCard
              title="Pemasukan Bulan Ini"
              value={formatRupiah(data?.totalPemasukanBulanIni ?? 0)}
              icon={<ArrowUpCircle className="size-5" />}
              iconClassName="bg-emerald-500/10 text-emerald-600 ring-emerald-500/20"
              trend={{ value: 12, label: "vs bulan lalu" }}
              delay={0.05}
            />
            <StatCard
              title="Pengeluaran Bulan Ini"
              value={formatRupiah(data?.totalPengeluaranBulanIni ?? 0)}
              icon={<ArrowDownCircle className="size-5" />}
              iconClassName="bg-rose-500/10 text-rose-600 ring-rose-500/20"
              trend={{ value: -8, label: "vs bulan lalu" }}
              delay={0.1}
            />
            <StatCard
              title="Saldo Total"
              value={formatRupiah(data?.saldo ?? 0)}
              icon={<Wallet className="size-5" />}
              iconClassName="bg-amber-500/10 text-amber-600 ring-amber-500/20"
              delay={0.15}
              description="Pemasukan - Pengeluaran"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-4 sm:p-5 lg:col-span-3">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold">Arus Keuangan</h3>
              <p className="text-xs text-muted-foreground">6 bulan terakhir</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-emerald-500" />
                Pemasukan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-rose-500" />
                Pengeluaran
              </span>
            </div>
          </div>
          <div className="h-56 w-full sm:h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chartData ?? []}>
                  <defs>
                    <linearGradient id="colorPem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPeng" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.7 0.02 155 / 0.15)" />
                  <XAxis
                    dataKey="bulan"
                    stroke="oklch(0.5 0.02 155)"
                    style={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="oklch(0.5 0.02 155)"
                    style={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid oklch(0.91 0.01 155)",
                      background: "oklch(1 0 0 / 0.95)",
                      backdropFilter: "blur(8px)",
                      boxShadow: "0 8px 32px -8px rgba(0,0,0,0.15)",
                    }}
                    formatter={(value: number) => formatRupiah(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="pemasukan"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#colorPem)"
                  />
                  <Area
                    type="monotone"
                    dataKey="pengeluaran"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    fill="url(#colorPeng)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-4 sm:p-5 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-base font-semibold">Status Tagihan</h3>
            <p className="text-xs text-muted-foreground">
              Total {data?.totalTagihan ?? 0} tagihan
            </p>
          </div>
          {isLoading ? (
            <Skeleton className="h-60 w-full sm:h-72" />
          ) : (
            <div className="relative h-48 sm:h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid oklch(0.91 0.01 155)",
                      background: "oklch(1 0 0 / 0.95)",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <p className="text-xs text-muted-foreground">Lunas</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {data?.tagihanLunas ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-amber-500/10 p-2">
              <p className="text-xs text-muted-foreground">Sebagian</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {data?.tagihanSebagian ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-rose-500/10 p-2">
              <p className="text-xs text-muted-foreground">Belum</p>
              <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                {data?.tagihanBelumBayar ?? 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-border p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-primary" />
            <div>
              <h3 className="text-base font-semibold">Pembayaran Terbaru</h3>
              <p className="text-xs text-muted-foreground">5 transaksi terakhir</p>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/dashboard/pembayaran">Lihat Semua</Link>
          </Button>
        </div>
        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Siswa</TableHead>
                <TableHead>Kode Transaksi</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data?.pembayaranRecent && data.pembayaranRecent.length > 0 ? (
                data.pembayaranRecent.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">
                      {p.siswa?.nama ?? "-"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.kodeTransaksi}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {LABEL_METODE[p.metode as keyof typeof LABEL_METODE] ?? p.metode}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTanggalSingkat(p.tanggalBayar)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatRupiah(p.jumlah)}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge value={p.status} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    Belum ada pembayaran
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* Mobile cards */}
        <div className="divide-y divide-border md:hidden">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-14 w-full" />
              </div>
            ))
          ) : data?.pembayaranRecent && data.pembayaranRecent.length > 0 ? (
            data.pembayaranRecent.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.siswa?.nama ?? "-"}</p>
                  <p className="font-mono text-xs text-muted-foreground">{p.kodeTransaksi}</p>
                  <p className="text-xs text-muted-foreground">
                    {LABEL_METODE[p.metode as keyof typeof LABEL_METODE] ?? p.metode} · {formatTanggalSingkat(p.tanggalBayar)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-semibold">{formatRupiah(p.jumlah)}</span>
                  <StatusBadge value={p.status} />
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Belum ada pembayaran
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
