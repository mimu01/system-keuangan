"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { GraduationCap, Pencil, Plus, Users } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LABEL_STATUS_SISWA } from "@/lib/types";

const schema = z.object({
  nis: z.string().min(1, "NIS wajib diisi"),
  nisn: z.string().optional(),
  nama: z.string().min(1, "Nama wajib diisi"),
  jenisKelamin: z.enum(["L", "P"], { message: "Pilih jenis kelamin" }),
  tempatLahir: z.string().optional(),
  tanggalLahir: z.string().optional(),
  alamat: z.string().optional(),
  kelasId: z.string().optional(),
  tahunAjaranId: z.string().optional(),
  status: z.enum(["AKTIF", "LULUS", "PINDAH", "NONAKTIF"]).default("AKTIF"),
});

type FormValues = z.infer<typeof schema>;

export default function SiswaPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kelasFilter, setKelasFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["siswa", search, statusFilter, kelasFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        kelasId: kelasFilter,
      });
      const res = await fetch(`/api/siswa?${params}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      return res.json();
    },
  });

  const { data: kelasList } = useQuery({
    queryKey: ["kelas-list"],
    queryFn: async () => {
      const res = await fetch("/api/kelas-list");
      if (!res.ok) throw new Error("Gagal memuat kelas");
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
      nis: "",
      nisn: "",
      nama: "",
      jenisKelamin: "L",
      tempatLahir: "",
      tanggalLahir: "",
      alamat: "",
      kelasId: "",
      tahunAjaranId: "",
      status: "AKTIF",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = editingId ? `/api/siswa/${editingId}` : "/api/siswa";
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
    onSuccess: (data) => {
      toast.success(editingId ? "Data siswa berhasil diperbarui" : "Data siswa berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["siswa"] });
      queryClient.invalidateQueries({ queryKey: ["siswa-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setOpen(false);
      reset();
      setEditingId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/siswa/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal menghapus");
      }
    },
    onSuccess: () => {
      toast.success("Data siswa berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["siswa"] });
      queryClient.invalidateQueries({ queryKey: ["siswa-list"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openCreate = () => {
    reset();
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (siswa: any) => {
    setEditingId(siswa.id);
    setValue("nis", siswa.nis);
    setValue("nisn", siswa.nisn ?? "");
    setValue("nama", siswa.nama);
    setValue("jenisKelamin", siswa.jenisKelamin as "L" | "P");
    setValue("tempatLahir", siswa.tempatLahir ?? "");
    setValue("tanggalLahir", siswa.tanggalLahir ? siswa.tanggalLahir.split("T")[0] : "");
    setValue("alamat", siswa.alamat ?? "");
    setValue("kelasId", siswa.kelasId ?? "");
    setValue("tahunAjaranId", siswa.tahunAjaranId ?? "");
    setValue("status", siswa.status as any);
    setOpen(true);
  };

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Siswa"
        description="Kelola data siswa MI Miftahul Ulum 01"
        icon={<GraduationCap className="size-5" />}
        actions={
          <Button onClick={openCreate} className="gradient-emerald text-white">
            <Plus className="mr-2 size-4" />
            Tambah Siswa
          </Button>
        }
      />

      <DataTableShell
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama, NIS, NISN..."
        filters={
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {Object.entries(LABEL_STATUS_SISWA).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={kelasFilter} onValueChange={setKelasFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {kelasList?.data?.map((k: any) => (
                  <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
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
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>L/P</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Tahun Ajaran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : data?.data?.length ? (
                  data.data.map((siswa: any, i: number) => (
                    <motion.tr
                      key={siswa.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-muted/40 border-b border-border"
                    >
                      <TableCell className="font-mono text-xs">{siswa.nis}</TableCell>
                      <TableCell className="font-medium">{siswa.nama}</TableCell>
                      <TableCell>
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {siswa.jenisKelamin}
                        </span>
                      </TableCell>
                      <TableCell>{siswa.kelas?.nama ?? "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {siswa.tahunAjaran?.nama ?? "-"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={siswa.status} label={LABEL_STATUS_SISWA[siswa.status as keyof typeof LABEL_STATUS_SISWA]} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => openEdit(siswa)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <ConfirmDelete
                            onConfirm={() => deleteMutation.mutate(siswa.id)}
                            description={`Hapus siswa ${siswa.nama}? Tindakan ini tidak dapat dibatalkan.`}
                          />
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16">
                      <EmptyState
                        icon={<Users className="size-6" />}
                        title="Belum ada data siswa"
                        description="Tambahkan siswa pertama Anda untuk memulai"
                        action={
                          <Button onClick={openCreate} className="gradient-emerald text-white">
                            <Plus className="mr-2 size-4" />
                            Tambah Siswa
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
              <Card key={i} className="p-4"><Skeleton className="h-20 w-full" /></Card>
            ))
          ) : data?.data?.length ? (
            data.data.map((siswa: any, i: number) => (
              <motion.div
                key={siswa.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold">{siswa.nama}</p>
                        <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {siswa.jenisKelamin}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">NIS: {siswa.nis}</p>
                      <p className="text-xs text-muted-foreground">
                        {siswa.kelas?.nama ?? "-"} · {siswa.tahunAjaran?.nama ?? "-"}
                      </p>
                      <StatusBadge value={siswa.status} label={LABEL_STATUS_SISWA[siswa.status as keyof typeof LABEL_STATUS_SISWA]} />
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(siswa)}>
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmDelete
                        onConfirm={() => deleteMutation.mutate(siswa.id)}
                        description={`Hapus siswa ${siswa.nama}? Tindakan ini tidak dapat dibatalkan.`}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="p-8">
              <EmptyState
                icon={<Users className="size-6" />}
                title="Belum ada data siswa"
                description="Tambahkan siswa pertama Anda untuk memulai"
                action={
                  <Button onClick={openCreate} className="gradient-emerald text-white">
                    <Plus className="mr-2 size-4" />
                    Tambah Siswa
                  </Button>
                }
              />
            </Card>
          )}
        </div>
      </DataTableShell>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Siswa" : "Tambah Siswa Baru"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Perbarui informasi siswa di bawah ini."
                : "Lengkapi data siswa di bawah ini."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>NIS *</Label>
                <Input {...register("nis")} placeholder="Contoh: 2024001" />
                {errors.nis && <p className="text-xs text-destructive">{errors.nis.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>NISN</Label>
                <Input {...register("nisn")} placeholder="Nomor Induk Siswa Nasional" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nama Lengkap *</Label>
              <Input {...register("nama")} placeholder="Nama lengkap siswa" />
              {errors.nama && <p className="text-xs text-destructive">{errors.nama.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Jenis Kelamin *</Label>
                <Select
                  value={watch("jenisKelamin")}
                  onValueChange={(v) => setValue("jenisKelamin", v as "L" | "P")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
                {errors.jenisKelamin && <p className="text-xs text-destructive">{errors.jenisKelamin.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(v) => setValue("status", v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LABEL_STATUS_SISWA).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tempat Lahir</Label>
                <Input {...register("tempatLahir")} placeholder="Contoh: Surabaya" />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Lahir</Label>
                <Input type="date" {...register("tanggalLahir")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Alamat</Label>
              <Input {...register("alamat")} placeholder="Alamat lengkap" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Kelas</Label>
                <Select
                  value={watch("kelasId") ?? "none"}
                  onValueChange={(v) => setValue("kelasId", v === "none" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
                    {kelasList?.data?.map((k: any) => (
                      <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tahun Ajaran</Label>
                <Select
                  value={watch("tahunAjaranId") ?? "none"}
                  onValueChange={(v) => setValue("tahunAjaranId", v === "none" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahun ajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
                    {taList?.data?.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>{t.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="gradient-emerald text-white">
                {mutation.isPending ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Siswa"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
