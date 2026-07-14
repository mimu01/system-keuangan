"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { CalendarDays, Pencil, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTanggal } from "@/lib/types";

const schema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  tanggalMulai: z.string().min(1, "Tanggal mulai wajib diisi"),
  tanggalSelesai: z.string().min(1, "Tanggal selesai wajib diisi"),
  aktif: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

export default function TahunAjaranPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["tahun-ajaran"],
    queryFn: async () => {
      const res = await fetch("/api/tahun-ajaran");
      if (!res.ok) throw new Error("Gagal memuat data");
      return res.json();
    },
  });

  const filteredData = (data?.data ?? []).filter((t: any) =>
    t.nama.toLowerCase().includes(search.toLowerCase())
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nama: "", tanggalMulai: "", tanggalSelesai: "", aktif: false },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = editingId ? `/api/tahun-ajaran/${editingId}` : "/api/tahun-ajaran";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan");
      return data;
    },
    onSuccess: () => {
      toast.success(editingId ? "Tahun ajaran diperbarui" : "Tahun ajaran ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["tahun-ajaran"] });
      queryClient.invalidateQueries({ queryKey: ["tahun-ajaran-list"] });
      setOpen(false);
      reset();
      setEditingId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tahun-ajaran/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal menghapus");
      }
    },
    onSuccess: () => {
      toast.success("Tahun ajaran dihapus");
      queryClient.invalidateQueries({ queryKey: ["tahun-ajaran"] });
      queryClient.invalidateQueries({ queryKey: ["tahun-ajaran-list"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openCreate = () => {
    reset();
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (t: any) => {
    setEditingId(t.id);
    setValue("nama", t.nama);
    setValue("tanggalMulai", t.tanggalMulai?.split("T")[0] ?? "");
    setValue("tanggalSelesai", t.tanggalSelesai?.split("T")[0] ?? "");
    setValue("aktif", t.aktif);
    setOpen(true);
  };

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tahun Ajaran"
        description="Kelola tahun ajaran sekolah"
        icon={<CalendarDays className="size-5" />}
        actions={
          <Button onClick={openCreate} className="gradient-emerald text-white">
            <Plus className="mr-2 size-4" />
            Tambah Tahun Ajaran
          </Button>
        }
      />

      <DataTableShell
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama tahun ajaran..."
      >
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tanggal Mulai</TableHead>
                  <TableHead>Tanggal Selesai</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredData.length ? (
                  filteredData.map((t: any, i: number) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-muted/40 border-b border-border"
                    >
                      <TableCell className="font-semibold">{t.nama}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatTanggal(t.tanggalMulai)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatTanggal(t.tanggalSelesai)}</TableCell>
                      <TableCell>
                        {t.aktif ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="size-3" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-zinc-500/10 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            Nonaktif
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(t)}>
                            <Pencil className="size-4" />
                          </Button>
                          <ConfirmDelete
                            onConfirm={() => deleteMutation.mutate(t.id)}
                            description={`Hapus tahun ajaran ${t.nama}?`}
                          />
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16">
                      <EmptyState
                        icon={<CalendarDays className="size-6" />}
                        title="Belum ada tahun ajaran"
                        description="Tambahkan tahun ajaran pertama Anda"
                        action={
                          <Button onClick={openCreate} className="gradient-emerald text-white">
                            <Plus className="mr-2 size-4" />
                            Tambah Tahun Ajaran
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </DataTableShell>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Perbarui informasi tahun ajaran." : "Lengkapi data tahun ajaran."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Tahun Ajaran *</Label>
              <Input {...register("nama")} placeholder="Contoh: 2024/2025" />
              {errors.nama && <p className="text-xs text-destructive">{errors.nama.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tanggal Mulai *</Label>
                <Input type="date" {...register("tanggalMulai")} />
                {errors.tanggalMulai && <p className="text-xs text-destructive">{errors.tanggalMulai.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Tanggal Selesai *</Label>
                <Input type="date" {...register("tanggalSelesai")} />
                {errors.tanggalSelesai && <p className="text-xs text-destructive">{errors.tanggalSelesai.message}</p>}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="aktif-ta">Tahun Ajaran Aktif</Label>
                <p className="text-xs text-muted-foreground">Hanya satu tahun ajaran yang dapat aktif</p>
              </div>
              <Switch id="aktif-ta" checked={watch("aktif")} onCheckedChange={(v) => setValue("aktif", v)} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={mutation.isPending} className="gradient-emerald text-white">
                {mutation.isPending ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
