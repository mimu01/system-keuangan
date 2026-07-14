"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Pencil, Plus, School, Users } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  nama: z.string().min(1, "Nama kelas wajib diisi"),
  tingkat: z.coerce.number().int().min(1, "Tingkat minimal 1").max(6, "Tingkat maksimal 6"),
  tahunAjaranId: z.string().min(1, "Tahun ajaran wajib dipilih"),
  waliKelas: z.string().optional(),
  kapasitas: z.coerce.number().int().min(1, "Kapasitas minimal 1").default(30),
});

type FormValues = z.infer<typeof schema>;

export default function KelasPage() {
  const [search, setSearch] = useState("");
  const [tahunFilter, setTahunFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["kelas", search, tahunFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ search, tahunAjaranId: tahunFilter });
      const res = await fetch(`/api/kelas?${params}`);
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
      tingkat: 1,
      tahunAjaranId: "",
      waliKelas: "",
      kapasitas: 30,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = editingId ? `/api/kelas/${editingId}` : "/api/kelas";
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
      toast.success(editingId ? "Kelas diperbarui" : "Kelas ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["kelas"] });
      queryClient.invalidateQueries({ queryKey: ["kelas-list"] });
      setOpen(false);
      reset();
      setEditingId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/kelas/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal menghapus");
      }
    },
    onSuccess: () => {
      toast.success("Kelas dihapus");
      queryClient.invalidateQueries({ queryKey: ["kelas"] });
      queryClient.invalidateQueries({ queryKey: ["kelas-list"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openCreate = () => {
    reset();
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (k: any) => {
    setEditingId(k.id);
    setValue("nama", k.nama);
    setValue("tingkat", k.tingkat);
    setValue("tahunAjaranId", k.tahunAjaranId);
    setValue("waliKelas", k.waliKelas ?? "");
    setValue("kapasitas", k.kapasitas);
    setOpen(true);
  };

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Kelas"
        description="Kelola kelas-kelas di sekolah"
        icon={<School className="size-5" />}
        actions={
          <Button onClick={openCreate} className="gradient-emerald text-white">
            <Plus className="mr-2 size-4" />
            Tambah Kelas
          </Button>
        }
      />

      <DataTableShell
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama kelas..."
        filters={
          <Select value={tahunFilter} onValueChange={setTahunFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tahun Ajaran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tahun</SelectItem>
              {taList?.data?.map((t: any) => (
                <SelectItem key={t.id} value={t.id}>{t.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      >
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tingkat</TableHead>
                  <TableHead>Wali Kelas</TableHead>
                  <TableHead>Tahun Ajaran</TableHead>
                  <TableHead>Jumlah Siswa</TableHead>
                  <TableHead>Kapasitas</TableHead>
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
                  data.data.map((k: any, i: number) => (
                    <motion.tr
                      key={k.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-muted/40 border-b border-border"
                    >
                      <TableCell className="font-semibold">{k.nama}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-full">Tingkat {k.tingkat}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{k.waliKelas ?? "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{k.tahunAjaran?.nama ?? "-"}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <Users className="size-3.5 text-muted-foreground" />
                          {k._count?.siswa ?? 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{k.kapasitas}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(k)}>
                            <Pencil className="size-4" />
                          </Button>
                          <ConfirmDelete
                            onConfirm={() => deleteMutation.mutate(k.id)}
                            description={`Hapus kelas ${k.nama}?`}
                          />
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16">
                      <EmptyState
                        icon={<School className="size-6" />}
                        title="Belum ada kelas"
                        description="Tambahkan kelas pertama Anda untuk memulai"
                        action={
                          <Button onClick={openCreate} className="gradient-emerald text-white">
                            <Plus className="mr-2 size-4" />
                            Tambah Kelas
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Kelas" : "Tambah Kelas Baru"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Perbarui informasi kelas." : "Lengkapi data kelas."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nama Kelas *</Label>
                <Input {...register("nama")} placeholder="Contoh: 1A, 2B" />
                {errors.nama && <p className="text-xs text-destructive">{errors.nama.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Tingkat (1-6) *</Label>
                <Input type="number" min={1} max={6} {...register("tingkat")} />
                {errors.tingkat && <p className="text-xs text-destructive">{errors.tingkat.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Wali Kelas</Label>
              <Input {...register("waliKelas")} placeholder="Nama wali kelas" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Kapasitas *</Label>
                <Input type="number" min={1} {...register("kapasitas")} />
                {errors.kapasitas && <p className="text-xs text-destructive">{errors.kapasitas.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Tahun Ajaran *</Label>
                <Select value={watch("tahunAjaranId") ?? "none"} onValueChange={(v) => setValue("tahunAjaranId", v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Pilih tahun ajaran</SelectItem>
                    {taList?.data?.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>{t.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tahunAjaranId && <p className="text-xs text-destructive">{errors.tahunAjaranId.message}</p>}
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={mutation.isPending} className="gradient-emerald text-white">
                {mutation.isPending ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Kelas"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
