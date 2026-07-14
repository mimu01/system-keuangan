"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowDownCircle, Pencil, Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah, formatTanggalSingkat } from "@/lib/types";

const LABEL_KATEGORI_PENGELUARAN: Record<string, string> = {
  OPERASIONAL: "Operasional",
  GAJI: "Gaji",
  PEMBELIAN: "Pembelian",
  PEMELIHARAAN: "Pemeliharaan",
  LAINNYA: "Lainnya",
};

const schema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  deskripsi: z.string().optional(),
  jumlah: z.coerce.number().min(1, "Jumlah harus lebih dari 0"),
  kategori: z.enum(["OPERASIONAL", "GAJI", "PEMBELIAN", "PEMELIHARAAN", "LAINNYA"]),
  tanggal: z.string().optional(),
  bukti: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function PengeluaranPage() {
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["pengeluaran", search, kategoriFilter, from, to],
    queryFn: async () => {
      const params = new URLSearchParams({ search, kategori: kategoriFilter, from, to });
      const res = await fetch(`/api/pengeluaran?${params}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      return res.json();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      judul: "",
      deskripsi: "",
      jumlah: 0,
      kategori: "OPERASIONAL",
      tanggal: new Date().toISOString().split("T")[0],
      bukti: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = editingId ? `/api/pengeluaran/${editingId}` : "/api/pengeluaran";
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
      toast.success(editingId ? "Pengeluaran diperbarui" : "Pengeluaran ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["pengeluaran"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setOpen(false);
      reset();
      setEditingId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pengeluaran/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal menghapus");
      }
    },
    onSuccess: () => {
      toast.success("Pengeluaran dihapus");
      queryClient.invalidateQueries({ queryKey: ["pengeluaran"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openCreate = () => {
    reset();
    setValue("tanggal", new Date().toISOString().split("T")[0]);
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setValue("judul", p.judul);
    setValue("deskripsi", p.deskripsi ?? "");
    setValue("jumlah", p.jumlah);
    setValue("kategori", p.kategori);
    setValue("tanggal", p.tanggal?.split("T")[0] ?? "");
    setValue("bukti", p.bukti ?? "");
    setOpen(true);
  };

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  const totalPengeluaran = data?.data?.reduce((acc: number, p: any) => acc + p.jumlah, 0) ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengeluaran"
        description="Catat dan kelola pengeluaran sekolah"
        icon={<ArrowDownCircle className="size-5" />}
        actions={
          <Button onClick={openCreate} className="gradient-emerald text-white">
            <Plus className="mr-2 size-4" />
            Tambah Pengeluaran
          </Button>
        }
      />

      <DataTableShell
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari judul pengeluaran..."
        filters={
          <>
            <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Kategori" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {Object.entries(LABEL_KATEGORI_PENGELUARAN).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[150px]" />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[150px]" />
          </>
        }
      >
        <Card className="mb-4 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Pengeluaran (filter saat ini)</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {formatRupiah(totalPengeluaran)}
            </p>
          </div>
        </Card>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Dibuat Oleh</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.data?.length ? (
                  data.data.map((p: any, i: number) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-muted/40 border-b border-border"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{p.judul}</p>
                          {p.deskripsi && <p className="text-xs text-muted-foreground line-clamp-1">{p.deskripsi}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                          {LABEL_KATEGORI_PENGELUARAN[p.kategori] ?? p.kategori}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-rose-600 dark:text-rose-400">{formatRupiah(p.jumlah)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatTanggalSingkat(p.tanggal)}</TableCell>
                      <TableCell className="text-sm">{p.admin?.nama ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(p)}>
                            <Pencil className="size-4" />
                          </Button>
                          <ConfirmDelete
                            onConfirm={() => deleteMutation.mutate(p.id)}
                            description={`Hapus pengeluaran ${p.judul}?`}
                          />
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16">
                      <EmptyState
                        icon={<ArrowDownCircle className="size-6" />}
                        title="Belum ada pengeluaran"
                        description="Tambahkan pengeluaran pertama Anda"
                        action={
                          <Button onClick={openCreate} className="gradient-emerald text-white">
                            <Plus className="mr-2 size-4" />
                            Tambah Pengeluaran
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Pengeluaran" : "Tambah Pengeluaran"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Perbarui informasi pengeluaran." : "Lengkapi data pengeluaran."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Judul *</Label>
              <Input {...register("judul")} placeholder="Contoh: Pembelian ATK" />
              {errors.judul && <p className="text-xs text-destructive">{errors.judul.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea {...register("deskripsi")} placeholder="Deskripsi pengeluaran" rows={2} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Jumlah (Rp) *</Label>
                <Input type="number" min={0} {...register("jumlah")} />
                {errors.jumlah && <p className="text-xs text-destructive">{errors.jumlah.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Kategori *</Label>
                <Select value={watch("kategori")} onValueChange={(v) => setValue("kategori", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(LABEL_KATEGORI_PENGELUARAN).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.kategori && <p className="text-xs text-destructive">{errors.kategori.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input type="date" {...register("tanggal")} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={mutation.isPending} className="gradient-emerald text-white">
                {mutation.isPending ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Pengeluaran"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
