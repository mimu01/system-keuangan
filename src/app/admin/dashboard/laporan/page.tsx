"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Download, FileBarChart, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/admin/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatRupiah,
  formatTanggalSingkat,
  LABEL_KATEGORI,
} from "@/lib/types";

const LABEL_KATEGORI_PENGELUARAN: Record<string, string> = {
  OPERASIONAL: "Operasional",
  GAJI: "Gaji",
  PEMBELIAN: "Pembelian",
  PEMELIHARAAN: "Pemeliharaan",
  LAINNYA: "Lainnya",
};

export default function LaporanPage() {
  const today = new Date().toISOString().split("T")[0];
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  const firstDay = firstDayOfMonth.toISOString().split("T")[0];

  const [from, setFrom] = useState(firstDay);
  const [to, setTo] = useState(today);
  const [jenis, setJenis] = useState("SEMUA");

  const { data, isLoading } = useQuery({
    queryKey: ["laporan", from, to, jenis],
    queryFn: async () => {
      const params = new URLSearchParams({ from, to, jenis });
      const res = await fetch(`/api/laporan?${params}`);
      if (!res.ok) throw new Error("Gagal memuat laporan");
      return res.json();
    },
  });

  const handleExportCSV = () => {
    if (!data?.transactions?.length) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }
    const headers = ["Tanggal", "Tipe", "Kategori", "Deskripsi", "Siswa/Ref", "Jumlah"];
    const rows = data.transactions.map((t: any) => [
      formatTanggalSingkat(t.tanggal),
      t.tipe,
      t.kategori,
      t.deskripsi,
      t.siswa ?? t.ref ?? "",
      t.jumlah,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-keuangan-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Laporan CSV berhasil diunduh");
  };

  const handleExportExcel = () => {
    handleExportCSV();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Keuangan"
        description="Lihat dan ekspor laporan keuangan sekolah"
        icon={<FileBarChart className="size-5" />}
        actions={
          <>
            <Button variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="mr-2 size-4" />
              Export Excel
            </Button>
            <Button onClick={handleExportCSV} className="gradient-emerald text-white">
              <Download className="mr-2 size-4" />
              Export CSV
            </Button>
          </>
        }
      />

      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Dari Tanggal</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Sampai Tanggal</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Jenis</label>
            <Select value={jenis} onValueChange={setJenis}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SEMUA">Semua</SelectItem>
                <SelectItem value="PEMASUKAN">Pemasukan</SelectItem>
                <SelectItem value="PENGELUARAN">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              title="Total Pemasukan"
              value={formatRupiah(data?.summary?.totalPemasukan ?? 0)}
              icon={<motion.span initial={{ rotate: -90 }} animate={{ rotate: 0 }} className="text-xl">↑</motion.span>}
              iconClassName="bg-emerald-500/10 text-emerald-600 ring-emerald-500/20"
              delay={0}
            />
            <StatCard
              title="Total Pengeluaran"
              value={formatRupiah(data?.summary?.totalPengeluaran ?? 0)}
              icon={<motion.span initial={{ rotate: 90 }} animate={{ rotate: 0 }} className="text-xl">↓</motion.span>}
              iconClassName="bg-rose-500/10 text-rose-600 ring-rose-500/20"
              delay={0.05}
            />
            <StatCard
              title="Saldo"
              value={formatRupiah(data?.summary?.saldo ?? 0)}
              icon={<span className="text-xl">=</span>}
              iconClassName="bg-amber-500/10 text-amber-600 ring-amber-500/20"
              delay={0.1}
            />
          </>
        )}
      </div>

      {/* Transactions Table */}
      <DataTableShell
        searchValue=""
        onSearchChange={() => {}}
        searchPlaceholder="Filter di atas"
      >
        <Card className="overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Ref / Siswa</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.transactions?.length ? (
                  data.transactions.map((t: any, i: number) => (
                    <motion.tr
                      key={`${t.id}-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.01 }}
                      className="hover:bg-muted/40 border-b border-border"
                    >
                      <TableCell className="text-sm text-muted-foreground">{formatTanggalSingkat(t.tanggal)}</TableCell>
                      <TableCell>
                        <span
                          className={
                            t.tipe === "PEMASUKAN"
                              ? "inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                              : "inline-flex rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-400"
                          }
                        >
                          {t.tipe === "PEMASUKAN" ? "Pemasukan" : "Pengeluaran"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {t.tipe === "PEMASUKAN"
                          ? LABEL_KATEGORI[t.kategori as keyof typeof LABEL_KATEGORI] ?? t.kategori
                          : LABEL_KATEGORI_PENGELUARAN[t.kategori] ?? t.kategori}
                      </TableCell>
                      <TableCell className="font-medium">{t.deskripsi}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{t.siswa ?? t.ref ?? "-"}</TableCell>
                      <TableCell
                        className={
                          "text-right font-semibold " +
                          (t.tipe === "PEMASUKAN"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400")
                        }
                      >
                        {t.tipe === "PEMASUKAN" ? "+" : "-"}{formatRupiah(t.jumlah)}
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16">
                      <EmptyState
                        icon={<FileBarChart className="size-6" />}
                        title="Tidak ada transaksi"
                        description="Belum ada transaksi pada rentang tanggal ini"
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4"><Skeleton className="h-20 w-full" /></Card>
            ))
          ) : data?.transactions?.length ? (
            data.transactions.map((t: any, i: number) => {
              const isPemasukan = t.tipe === "PEMASUKAN";
              const kategoriLabel = isPemasukan
                ? LABEL_KATEGORI[t.kategori as keyof typeof LABEL_KATEGORI] ?? t.kategori
                : LABEL_KATEGORI_PENGELUARAN[t.kategori] ?? t.kategori;
              return (
                <motion.div
                  key={`${t.id}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.01 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              isPemasukan
                                ? "inline-flex shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                                : "inline-flex shrink-0 rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-400"
                            }
                          >
                            {isPemasukan ? "Pemasukan" : "Pengeluaran"}
                          </span>
                          <span className="text-xs text-muted-foreground">{formatTanggalSingkat(t.tanggal)}</span>
                        </div>
                        <p className="font-medium leading-tight">{t.deskripsi}</p>
                        <p className="text-xs text-muted-foreground">
                          {kategoriLabel}{t.siswa ?? t.ref ? ` · ${t.siswa ?? t.ref}` : ""}
                        </p>
                      </div>
                      <p
                        className={
                          "shrink-0 font-bold " +
                          (isPemasukan
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400")
                        }
                      >
                        {isPemasukan ? "+" : "-"}{formatRupiah(t.jumlah)}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card className="p-8">
              <EmptyState
                icon={<FileBarChart className="size-6" />}
                title="Tidak ada transaksi"
                description="Belum ada transaksi pada rentang tanggal ini"
              />
            </Card>
          )}
        </div>
      </DataTableShell>
    </div>
  );
}
