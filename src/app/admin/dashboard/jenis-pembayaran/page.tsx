"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Pencil, Plus, Tags } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { StatusBadge } from "@/components/admin/status-badge";
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
import { Switch } from "@/components/ui/switch";
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
  LABEL_KATEGORI,
  LABEL_FREKUENSI,
} from "@/lib/types";

const schema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  deskripsi: z.string().optional(),
  jumlah: z.coerce.number().min(1, "Jumlah harus lebih dari 0"),
  kategori: z.enum(["SPP", "PENGEMBANGAN", "KEGIATAN", "SERAGAM", "BUKU", "LAINNYA"]),
  frekuensi: z.enum(["BULANAN", "TAHUNAN", "SEKALI", "SEMESTER"]),
  tahunAjaranId: z.string().optional(),
  aktif: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

export default function JenisPembayaranPage() {
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["jenis-pembayaran", search, kategoriFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ search, kategori: kategoriFilter });
      const res = await fetch(`/api/jenis-pembayaran?${params}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      return res.json();
    },
  });

  const { data: taList } = useQuery({
    queryKey: ["tahun-ajaran-list"],
    queryFn: async () => {
      const res = await fetch("/api/tahun-ajaran-list");
      if (!res.ok) throw new Error("Gagal memuat tahun ajaran");
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
      nama: "",
      deskripsi: "",
      jumlah: 0,
      kategori: "SPP",
      frekuensi: "BULANAN",
      tahunAjaranId: "",
      aktif: true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = editingId ? `/api/jenis-pembayaran/${editingId}` : "/api/jenis-pembayaran";
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
      toast.success(editingId ? "Jenis pembayaran diperbarui" : "Jenis pembayaran ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["jenis-pembayaran"] });
      queryClient.invalidateQueries({ queryKey: ["jenis-pembayaran-list"] });
      setOpen(false);
      reset();
      setEditingId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/jenis-pembayaran/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal menghapus");
      }
    },
    onSuccess: () => {
      toast.success("Jenis pembayaran dihapus");
      queryClient.invalidateQueries({ queryKey: ["jenis-pembayaran"] });
      queryClient.invalidateQueries({ queryKey: ["jenis-pembayaran-list"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openCreate = () => {
    reset();
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (j: any) => {
    setEditingId(j.id);
    setValue("nama", j.nama);
    setValue("deskripsi", j.deskripsi ?? "");
    setValue("jumlah", j.jumlah);
    setValue("kategori", j.kategori);
    setValue("frekuensi", j.frekuensi);
    setValue("tahunAjaranId", j.tahunAjaranId ?? "");
    setValue("aktif", j.aktif);
    setOpen(true);
  };

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jenis Pembayaran"
        description="Daftar kategori pembayaran sekolah"
        icon={<Tags className="size-5" />}
        actions={
          <Button onClick={openCreate} className="gradient-emerald text-white">
            <Plus className="mr-2 size-4" />
            Tambah Jenis
          </Button>
        }
      />

      <DataTableShell
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama jenis pembayaran..."
        filters={
          <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {Object.entries(LABEL_KATEGORI).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      >
        <Card className="overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Frekuensi</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead>Tahun Ajaran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.data?.length ? (
                  data.data.map((j: any, i: number) => (
                    <motion.tr
                      key={j.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-muted/40 border-b border-border"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{j.nama}</p>
                          {j.deskripsi && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{j.deskripsi}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {LABEL_KATEGORI[j.kategori as keyof typeof LABEL_KATEGORI] ?? j.kategori}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{LABEL_FREKUENSI[j.frekuensi as keyof typeof LABEL_FREKUENSI] ?? j.frekuensi}</TableCell>
                      <TableCell className="text-right font-semibold">{formatRupiah(j.jumlah)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{j.tahunAjaran?.nama ?? "-"}</TableCell>
                      <TableCell>
                        <StatusBadge
                          value={String(j.aktif)}
                          label={j.aktif ? "Aktif" : "Nonaktif"}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(j)}>
                            <Pencil className="size-4" />
                          </Button>
                          <ConfirmDelete
                            onConfirm={() => deleteMutation.mutate(j.id)}
                            description={`Hapus jenis pembayaran ${j.nama}?`}
                          />
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16">
                      <EmptyState
                        icon={<Tags className="size-6" />}
                        title="Belum ada jenis pembayaran"
                        description="Tambahkan jenis pembayaran pertama Anda"
                        action={
                          <Button onClick={openCreate} className="gradient-emerald text-white">
                            <Plus className="mr-2 size-4" />
                            Tambah Jenis
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

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4"><Skeleton className="h-24 w-full" /></Card>
            ))
          ) : data?.data?.length ? (
            data.data.map((j: any, i: number) => (
              <motion.div
                key={j.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate font-semibold">{j.nama}</p>
                      {j.deskripsi && (
                        <p className="line-clamp-1 text-xs text-muted-foreground">{j.deskripsi}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {LABEL_KATEGORI[j.kategori as keyof typeof LABEL_KATEGORI] ?? j.kategori}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs">{LABEL_FREKUENSI[j.frekuensi as keyof typeof LABEL_FREKUENSI] ?? j.frekuensi}</span>
                      </div>
                      <p className="text-base font-bold text-foreground">{formatRupiah(j.jumlah)}</p>
                      <StatusBadge value={String(j.aktif)} label={j.aktif ? "Aktif" : "Nonaktif"} />
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(j)}>
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmDelete
                        onConfirm={() => deleteMutation.mutate(j.id)}
                        description={`Hapus jenis pembayaran ${j.nama}?`}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="p-8">
              <EmptyState
                icon={<Tags className="size-6" />}
                title="Belum ada jenis pembayaran"
                description="Tambahkan jenis pembayaran pertama Anda"
                action={
                  <Button onClick={openCreate} className="gradient-emerald text-white">
                    <Plus className="mr-2 size-4" />
                    Tambah Jenis
                  </Button>
                }
              />
            </Card>
          )}
        </div>
      </DataTableShell>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Jenis Pembayaran" : "Tambah Jenis Pembayaran"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Perbarui informasi jenis pembayaran." : "Lengkapi data jenis pembayaran."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama *</Label>
              <Input {...register("nama")} placeholder="Contoh: SPP Bulanan" />
              {errors.nama && <p className="text-xs text-destructive">{errors.nama.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea {...register("deskripsi")} placeholder="Deskripsi singkat" rows={2} />
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
                    {Object.entries(LABEL_KATEGORI).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.kategori && <p className="text-xs text-destructive">{errors.kategori.message}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Frekuensi *</Label>
                <Select value={watch("frekuensi")} onValueChange={(v) => setValue("frekuensi", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(LABEL_FREKUENSI).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.frekuensi && <p className="text-xs text-destructive">{errors.frekuensi.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Tahun Ajaran</Label>
                <Select value={watch("tahunAjaranId") ?? "none"} onValueChange={(v) => setValue("tahunAjaranId", v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
                    {taList?.data?.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>{t.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="aktif">Status Aktif</Label>
                <p className="text-xs text-muted-foreground">Jenis pembayaran dapat dipakai untuk tagihan baru</p>
              </div>
              <Switch
                id="aktif"
                checked={watch("aktif")}
                onCheckedChange={(v) => setValue("aktif", v)}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={mutation.isPending} className="gradient-emerald text-white">
                {mutation.isPending ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Jenis"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
