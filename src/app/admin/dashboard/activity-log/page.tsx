"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  History,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { EmptyState } from "@/components/admin/empty-state";
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
import { formatTanggalWaktu } from "@/lib/types";

const LABEL_AKSI: Record<string, string> = {
  CREATE: "Tambah",
  UPDATE: "Ubah",
  DELETE: "Hapus",
  LOGIN: "Masuk",
  LOGOUT: "Keluar",
};

const AKSI_ICON: Record<string, React.ElementType> = {
  CREATE: Plus,
  UPDATE: Pencil,
  DELETE: Trash2,
  LOGIN: LogIn,
  LOGOUT: LogOut,
};

const AKSI_COLOR: Record<string, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  UPDATE: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  DELETE: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  LOGIN: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  LOGOUT: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
};

export default function ActivityLogPage() {
  const [modulFilter, setModulFilter] = useState("all");
  const [aksiFilter, setAksiFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["activity-log", modulFilter, aksiFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ modul: modulFilter, aksi: aksiFilter });
      const res = await fetch(`/api/activity-log?${params}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      return res.json();
    },
  });

  const filtered = (data?.data ?? []).filter((l: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.deskripsi?.toLowerCase().includes(q) ||
      l.admin?.nama?.toLowerCase().includes(q)
    );
  });

  // Get unique modules for filter
  const modules = Array.from(
    new Set((data?.data ?? []).map((l: any) => l.modul))
  ).sort();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="Riwayat aktivitas admin di sistem"
        icon={<History className="size-5" />}
      />

      <DataTableShell
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari deskripsi, admin..."
        filters={
          <>
            <Select value={modulFilter} onValueChange={setModulFilter}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Modul" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Modul</SelectItem>
                {modules.map((m: string) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={aksiFilter} onValueChange={setAksiFilter}>
              <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Aksi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Aksi</SelectItem>
                {Object.entries(LABEL_AKSI).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      >
        <Card className="overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Modul</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filtered.length ? (
                  filtered.map((l: any, i: number) => {
                    const Icon = AKSI_ICON[l.aksi] ?? Activity;
                    return (
                      <motion.tr
                        key={l.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-muted/40 border-b border-border"
                      >
                        <TableCell className="font-medium">
                          {l.admin?.nama ?? <span className="text-muted-foreground">Sistem</span>}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${AKSI_COLOR[l.aksi] ?? ""}`}>
                            <Icon className="size-3" />
                            {LABEL_AKSI[l.aksi] ?? l.aksi}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                            {l.modul}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{l.deskripsi}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{l.ip ?? "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatTanggalWaktu(l.createdAt)}</TableCell>
                      </motion.tr>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16">
                      <EmptyState
                        icon={<History className="size-6" />}
                        title="Belum ada log aktivitas"
                        description="Aktivitas admin akan tampil di sini"
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
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4"><Skeleton className="h-28 w-full" /></Card>
            ))
          ) : filtered.length ? (
            filtered.map((l: any, i: number) => {
              const Icon = AKSI_ICON[l.aksi] ?? Activity;
              return (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Card className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium leading-tight">{l.deskripsi}</p>
                        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${AKSI_COLOR[l.aksi] ?? ""}`}>
                          <Icon className="size-3" />
                          {LABEL_AKSI[l.aksi] ?? l.aksi}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{l.admin?.nama ?? "Sistem"}</span>
                        <span>·</span>
                        <span className="inline-flex rounded-full bg-muted px-2 py-0.5 font-medium">{l.modul}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>{formatTanggalWaktu(l.createdAt)}</span>
                        {l.ip && <span className="font-mono">{l.ip}</span>}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card className="p-8">
              <EmptyState
                icon={<History className="size-6" />}
                title="Belum ada log aktivitas"
                description="Aktivitas admin akan tampil di sini"
              />
            </Card>
          )}
        </div>
      </DataTableShell>
    </div>
  );
}
