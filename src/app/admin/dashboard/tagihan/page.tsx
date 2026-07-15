"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Pencil, Plus, ReceiptText, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { DataTableShell } from "@/components/admin/data-table-shell";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import {
  formatRupiah,
  formatTanggalSingkat,
  LABEL_STATUS_TAGIHAN,
} from "@/lib/types";

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const schema = z.object({
  siswaId: z.string().min(1, "Siswa wajib dipilih"),
  jenisPembayaranId: z.string().min(1, "Jenis pembayaran wajib dipilih"),
  tahunAjaranId: z.string().min(1, "Tahun ajaran wajib dipilih"),
  periode: z.string().min(1, "Periode wajib diisi"),
  jumlah: z.coerce.number().min(1, "Jumlah harus lebih dari 0"),
  tanggalJatuhTempo: z.string().min(1, "Tanggal jatuh tempo wajib diisi"),
  keterangan: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const generateSchema = z.object({
  jenisPembayaranId: z.string().min(1, "Jenis pembayaran wajib dipilih"),
  tahunAjaranId: z.string().min(1, "Tahun ajaran wajib dipilih"),
  bulan: z.coerce.number().int().min(0).max(11),
  tahun: z.coerce.number().int().min(2020),
  kelasId: z.string().optional(),
});

type GenerateValues = z.infer<typeof generateSchema>;

export default function TagihanPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["tagihan", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ search, status: statusFilter });
      const res = await fetch(`/api/tagihan?${params}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      return res.json();
    },
  });

  const { data: siswaList } = useQuery({
    queryKey: ["siswa-list"],
    queryFn: async () => {
      const res = await fetch("/api/siswa-list");
      if (!res.ok) throw new Error("Gagal memuat siswa");
      return res.json();
    },
  });

  const { data: jenisList } = useQuery({
    queryKey: ["jenis-pembayaran-list"],
    queryFn: async () => {
      const res = await fetch("/api/jenis-pembayaran-list");
      if (!res.ok) throw new Error("Gagal memuat jenis");
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

  const { data: kelasList } = useQuery({
    queryKey: ["kelas-list"],
    queryFn: async () => {
      const res = await fetch("/api/kelas-list");
      if (!res.ok) throw new Error("Gagal memuat kelas");
      return res.json();
    },
  });

  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    reset: resetForm,
    setValue: setValueForm,
    watch: watchForm,
    formState: { errors: errorsForm },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      siswaId: "",
      jenisPembayaranId: "",
      tahunAjaranId: "",
      periode: "",
      jumlah: 0,
      tanggalJatuhTempo: "",
      keterangan: "",
    },
  });

  const {
    register: registerGen,
    handleSubmit: handleSubmitGen,
    reset: resetGen,
    setValue: setValueGen,
    watch: watchGen,
    formState: { errors: errorsGen },
  } = useForm<GenerateValues>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      jenisPembayaranId: "",
      tahunAjaranId: "",
      bulan: new Date().getMonth(),
      tahun: new Date().getFullYear(),
      kelasId: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = editingId ? `/api/tagihan/${editingId}` : "/api/tagihan";
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
      toast.success(editingId ? "Tagihan diperbarui" : "Tagihan ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["tagihan"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setOpen(false);
      resetForm();
      setEditingId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const genMutation = useMutation({
    mutationFn: async (values: GenerateValues) => {
      const res = await fetch("/api/tagihan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal generate");
      return data;
    },
    onSuccess: (data: any) => {
      toast.success(data.message ?? `Berhasil generate ${data.created} tagihan`);
      queryClient.invalidateQueries({ queryKey: ["tagihan"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setGenOpen(false);
      resetGen();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tagihan/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal menghapus");
      }
    },
    onSuccess: () => {
      toast.success("Tagihan dihapus");
      queryClient.invalidateQueries({ queryKey: ["tagihan"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openCreate = () => {
    resetForm();
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (t: any) => {
    setEditingId(t.id);
    setValueForm("siswaId", t.siswaId);
    setValueForm("jenisPembayaranId", t.jenisPembayaranId);
    setValueForm("tahunAjaranId", t.tahunAjaranId);
    setValueForm("periode", t.periode);
    setValueForm("jumlah", t.jumlah);
    setValueForm("tanggalJatuhTempo", t.tanggalJatuhTempo?.split("T")[0] ?? "");
    setValueForm("keterangan", t.keterangan ?? "");
    setOpen(true);
  };

  const onSubmit = (values: FormValues) => mutation.mutate(values);
  const onGenerate = (values: GenerateValues) => genMutation.mutate(values);

  const handleJenisChange = (jenisId: string) => {
    setValueForm("jenisPembayaranId", jenisId);
    const j = jenisList?.data?.find((x: any) => x.id === jenisId);
    if (j) setValueForm("jumlah", j.jumlah);
  };

  const handleSiswaChange = (siswaId: string) => {
    setValueForm("siswaId", siswaId);
    const ta = taList?.data?.find((t: any) => t.aktif);
    if (ta) setValueForm("tahunAjaranId", ta.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tagihan"
        description="Daftar tagihan pembayaran siswa"
        icon={<ReceiptText className="size-5" />}
        actions={
          <>
            <Button variant="outline" onClick={() => setGenOpen(true)}>
              <Sparkles className="mr-2 size-4" />
              Generate Massal
            </Button>
            <Button onClick={openCreate} className="gradient-emerald text-white">
              <Plus className="mr-2 size-4" />
              Tambah Tagihan
            </Button>
          </>
        }
      />

      <DataTableShell
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama siswa, periode..."
        filters={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {Object.entries(LABEL_STATUS_TAGIHAN).map(([v, l]) => (
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
                  <TableHead>Siswa</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Jatuh Tempo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.data?.length ? (
                  data.data.map((t: any, i: number) => {
                    const pct = t.jumlah > 0 ? Math.min(100, Math.round((t.jumlahDibayar / t.jumlah) * 100)) : 0;
                    return (
                      <motion.tr
                        key={t.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-muted/40 border-b border-border"
                      >
                        <TableCell className="font-medium">
                          {t.siswa?.nama ?? "-"}
                          <p className="text-xs text-muted-foreground">{t.siswa?.nis}</p>
                        </TableCell>
                        <TableCell className="text-sm">{t.jenisPembayaran?.nama ?? "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{t.periode}</TableCell>
                        <TableCell className="text-right font-semibold">{formatRupiah(t.jumlah)}</TableCell>
                        <TableCell className="min-w-[120px]">
                          <div className="space-y-1">
                            <Progress value={pct} className="h-1.5" />
                            <p className="text-xs text-muted-foreground">
                              {formatRupiah(t.jumlahDibayar)} / {formatRupiah(t.jumlah)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatTanggalSingkat(t.tanggalJatuhTempo)}</TableCell>
                        <TableCell>
                          <StatusBadge value={t.status} label={LABEL_STATUS_TAGIHAN[t.status as keyof typeof LABEL_STATUS_TAGIHAN]} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(t)}>
                              <Pencil className="size-4" />
                            </Button>
                            <ConfirmDelete
                              onConfirm={() => deleteMutation.mutate(t.id)}
                              description={`Hapus tagihan ${t.siswa?.nama} - ${t.periode}?`}
                            />
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16">
                      <EmptyState
                        icon={<ReceiptText className="size-6" />}
                        title="Belum ada tagihan"
                        description="Tambahkan tagihan atau gunakan generate massal"
                        action={
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setGenOpen(true)}>
                              <Sparkles className="mr-2 size-4" />
                              Generate Massal
                            </Button>
                            <Button onClick={openCreate} className="gradient-emerald text-white">
                              <Plus className="mr-2 size-4" />
                              Tambah Tagihan
                            </Button>
                          </div>
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
              <Card key={i} className="p-4"><Skeleton className="h-28 w-full" /></Card>
            ))
          ) : data?.data?.length ? (
            data.data.map((t: any, i: number) => {
              const pct = t.jumlah > 0 ? Math.min(100, Math.round((t.jumlahDibayar / t.jumlah) * 100)) : 0;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="truncate font-semibold">{t.siswa?.nama ?? "-"}</p>
                        <p className="text-xs text-muted-foreground">{t.siswa?.nis}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.jenisPembayaran?.nama ?? "-"} · {t.periode}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(t)}>
                          <Pencil className="size-4" />
                        </Button>
                        <ConfirmDelete
                          onConfirm={() => deleteMutation.mutate(t.id)}
                          description={`Hapus tagihan ${t.siswa?.nama} - ${t.periode}?`}
                        />
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress Pembayaran</span>
                        <span className="font-semibold">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">
                        {formatRupiah(t.jumlahDibayar)} / {formatRupiah(t.jumlah)}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">Jatuh tempo: {formatTanggalSingkat(t.tanggalJatuhTempo)}</span>
                      <StatusBadge value={t.status} label={LABEL_STATUS_TAGIHAN[t.status as keyof typeof LABEL_STATUS_TAGIHAN]} />
                    </div>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card className="p-8">
              <EmptyState
                icon={<ReceiptText className="size-6" />}
                title="Belum ada tagihan"
                description="Tambahkan tagihan atau gunakan generate massal"
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button variant="outline" onClick={() => setGenOpen(true)}>
                      <Sparkles className="mr-2 size-4" />
                      Generate Massal
                    </Button>
                    <Button onClick={openCreate} className="gradient-emerald text-white">
                      <Plus className="mr-2 size-4" />
                      Tambah Tagihan
                    </Button>
                  </div>
                }
              />
            </Card>
          )}
        </div>
      </DataTableShell>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Tagihan" : "Tambah Tagihan"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Perbarui informasi tagihan." : "Lengkapi data tagihan."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitForm(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Siswa *</Label>
              <Select value={watchForm("siswaId") ?? "none"} onValueChange={handleSiswaChange}>
                <SelectTrigger><SelectValue placeholder="Pilih siswa" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Pilih siswa</SelectItem>
                  {siswaList?.data?.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.nama} ({s.nis})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errorsForm.siswaId && <p className="text-xs text-destructive">{errorsForm.siswaId.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Jenis Pembayaran *</Label>
                <Select value={watchForm("jenisPembayaranId") ?? "none"} onValueChange={handleJenisChange}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Pilih jenis</SelectItem>
                    {jenisList?.data?.map((j: any) => (
                      <SelectItem key={j.id} value={j.id}>{j.nama} ({formatRupiah(j.jumlah)})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errorsForm.jenisPembayaranId && <p className="text-xs text-destructive">{errorsForm.jenisPembayaranId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Tahun Ajaran *</Label>
                <Select value={watchForm("tahunAjaranId") ?? "none"} onValueChange={(v) => setValueForm("tahunAjaranId", v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Pilih tahun ajaran</SelectItem>
                    {taList?.data?.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>{t.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errorsForm.tahunAjaranId && <p className="text-xs text-destructive">{errorsForm.tahunAjaranId.message}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Periode *</Label>
                <Input {...registerForm("periode")} placeholder="Contoh: 2024-10 atau 2024/2025" />
                {errorsForm.periode && <p className="text-xs text-destructive">{errorsForm.periode.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Jumlah (Rp) *</Label>
                <Input type="number" min={0} {...registerForm("jumlah")} />
                {errorsForm.jumlah && <p className="text-xs text-destructive">{errorsForm.jumlah.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tanggal Jatuh Tempo *</Label>
              <Input type="date" {...registerForm("tanggalJatuhTempo")} />
              {errorsForm.tanggalJatuhTempo && <p className="text-xs text-destructive">{errorsForm.tanggalJatuhTempo.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Keterangan</Label>
              <Textarea {...registerForm("keterangan")} placeholder="Keterangan tambahan" rows={2} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={mutation.isPending} className="gradient-emerald text-white">
                {mutation.isPending ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Tagihan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Generate Massal Dialog */}
      <Dialog open={genOpen} onOpenChange={setGenOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Generate Tagihan Massal
            </DialogTitle>
            <DialogDescription>
              Buat tagihan otomatis untuk semua siswa aktif berdasarkan jenis pembayaran & periode yang dipilih.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitGen(onGenerate)} className="space-y-4">
            <div className="space-y-2">
              <Label>Jenis Pembayaran *</Label>
              <Select value={watchGen("jenisPembayaranId") ?? "none"} onValueChange={(v) => setValueGen("jenisPembayaranId", v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Pilih jenis</SelectItem>
                  {jenisList?.data?.map((j: any) => (
                    <SelectItem key={j.id} value={j.id}>{j.nama} ({formatRupiah(j.jumlah)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errorsGen.jenisPembayaranId && <p className="text-xs text-destructive">{errorsGen.jenisPembayaranId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tahun Ajaran *</Label>
              <Select value={watchGen("tahunAjaranId") ?? "none"} onValueChange={(v) => setValueGen("tahunAjaranId", v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Pilih tahun ajaran" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Pilih tahun ajaran</SelectItem>
                  {taList?.data?.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errorsGen.tahunAjaranId && <p className="text-xs text-destructive">{errorsGen.tahunAjaranId.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Bulan *</Label>
                <Select value={String(watchGen("bulan"))} onValueChange={(v) => setValueGen("bulan", parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {NAMA_BULAN.map((b, i) => (
                      <SelectItem key={i} value={String(i)}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tahun *</Label>
                <Input type="number" min={2020} {...registerGen("tahun")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Filter Kelas (opsional)</Label>
              <Select value={watchGen("kelasId") ?? "all"} onValueChange={(v) => setValueGen("kelasId", v === "all" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Semua kelas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {kelasList?.data?.map((k: any) => (
                    <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Tagihan yang sudah ada untuk siswa & periode ini akan dilewati otomatis.
              </p>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setGenOpen(false)}>Batal</Button>
              <Button type="submit" disabled={genMutation.isPending} className="gradient-emerald text-white">
                {genMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Generate Tagihan
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
