"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, Plus, Trash2, Wallet } from "lucide-react";
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
  formatTanggalWaktu,
  LABEL_METODE,
  LABEL_STATUS_PEMBAYARAN,
  LABEL_STATUS_TAGIHAN,
} from "@/lib/types";

const schema = z.object({
  tagihanId: z.string().min(1, "Tagihan wajib dipilih"),
  jumlah: z.coerce.number().min(1, "Jumlah harus lebih dari 0"),
  metode: z.enum(["TUNAI", "TRANSFER", "QRISS", "EWALLET"]),
  tanggalBayar: z.string().optional(),
  keterangan: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function PembayaranPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [metodeFilter, setMetodeFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["pembayaran", search, statusFilter, metodeFilter, from, to],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        metode: metodeFilter,
        from,
        to,
      });
      const res = await fetch(`/api/pembayaran?${params}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      return res.json();
    },
  });

  const { data: tagihanList } = useQuery({
    queryKey: ["tagihan-list", "open"],
    queryFn: async () => {
      const res = await fetch(`/api/tagihan-list`);
      if (!res.ok) throw new Error("Gagal memuat tagihan");
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
      tagihanId: "",
      jumlah: 0,
      metode: "TUNAI",
      tanggalBayar: new Date().toISOString().split("T")[0],
      keterangan: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await fetch("/api/pembayaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan");
      return data;
    },
    onSuccess: () => {
      toast.success("Pembayaran berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["pembayaran"] });
      queryClient.invalidateQueries({ queryKey: ["tagihan"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setOpen(false);
      reset();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pembayaran/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal menghapus");
      }
    },
    onSuccess: () => {
      toast.success("Pembayaran dihapus");
      queryClient.invalidateQueries({ queryKey: ["pembayaran"] });
      queryClient.invalidateQueries({ queryKey: ["tagihan"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openCreate = () => {
    reset();
    setValue("tanggalBayar", new Date().toISOString().split("T")[0]);
    setOpen(true);
  };

  const handleTagihanChange = (id: string) => {
    setValue("tagihanId", id);
    const t = tagihanList?.data?.find((x: any) => x.id === id);
    if (t) {
      const sisa = t.jumlah - t.jumlahDibayar;
      setValue("jumlah", sisa);
    }
  };

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  const selectedTagihan = tagihanList?.data?.find((t: any) => t.id === watch("tagihanId"));
  const sisaTagihan = selectedTagihan
    ? selectedTagihan.jumlah - selectedTagihan.jumlahDibayar
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pembayaran"
        description="Riwayat & penerimaan pembayaran siswa"
        icon={<Wallet className="size-5" />}
        actions={
          <Button onClick={openCreate} className="gradient-emerald text-white">
            <Plus className="mr-2 size-4" />
            Terima Pembayaran
          </Button>
        }
      />

      <DataTableShell
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari kode transaksi, nama siswa..."
        filters={
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {Object.entries(LABEL_STATUS_PEMBAYARAN).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={metodeFilter} onValueChange={setMetodeFilter}>
              <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Metode" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Metode</SelectItem>
                {Object.entries(LABEL_METODE).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full sm:w-[150px]" />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full sm:w-[150px]" />
          </>
        }
      >
        <Card className="overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Transaksi</TableHead>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
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
                  data.data.map((p: any, i: number) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-muted/40 border-b border-border"
                    >
                      <TableCell className="font-mono text-xs">{p.kodeTransaksi}</TableCell>
                      <TableCell className="font-medium">{p.tagihan?.siswa?.nama ?? "-"}</TableCell>
                      <TableCell className="text-sm">{p.tagihan?.jenisPembayaran?.nama ?? "-"}</TableCell>
                      <TableCell className="text-sm">{LABEL_METODE[p.metode as keyof typeof LABEL_METODE] ?? p.metode}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatTanggalSingkat(p.tanggalBayar)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatRupiah(p.jumlah)}</TableCell>
                      <TableCell><StatusBadge value={p.status} label={LABEL_STATUS_PEMBAYARAN[p.status as keyof typeof LABEL_STATUS_PEMBAYARAN]} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => setDetailItem(p)}>
                            <Eye className="size-4" />
                          </Button>
                          <ConfirmDelete
                            onConfirm={() => deleteMutation.mutate(p.id)}
                            description={`Hapus pembayaran ${p.kodeTransaksi}? Tagihan akan dikembalikan ke jumlah sebelumnya.`}
                            title="Hapus Pembayaran"
                          />
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16">
                      <EmptyState
                        icon={<Wallet className="size-6" />}
                        title="Belum ada pembayaran"
                        description="Terima pembayaran pertama Anda"
                        action={
                          <Button onClick={openCreate} className="gradient-emerald text-white">
                            <Plus className="mr-2 size-4" />
                            Terima Pembayaran
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
              <Card key={i} className="p-4"><Skeleton className="h-28 w-full" /></Card>
            ))
          ) : data?.data?.length ? (
            data.data.map((p: any, i: number) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate font-semibold">{p.tagihan?.siswa?.nama ?? "-"}</p>
                      <p className="font-mono text-xs text-muted-foreground">{p.kodeTransaksi}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.tagihan?.jenisPembayaran?.nama ?? "-"} · {LABEL_METODE[p.metode as keyof typeof LABEL_METODE] ?? p.metode} · {formatTanggalSingkat(p.tanggalBayar)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-foreground">{formatRupiah(p.jumlah)}</span>
                      <StatusBadge value={p.status} label={LABEL_STATUS_PEMBAYARAN[p.status as keyof typeof LABEL_STATUS_PEMBAYARAN]} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-1">
                    <Button variant="outline" size="sm" onClick={() => setDetailItem(p)}>
                      <Eye className="mr-1.5 size-4" />
                      Detail
                    </Button>
                    <ConfirmDelete
                      onConfirm={() => deleteMutation.mutate(p.id)}
                      description={`Hapus pembayaran ${p.kodeTransaksi}? Tagihan akan dikembalikan ke jumlah sebelumnya.`}
                      title="Hapus Pembayaran"
                    />
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="p-8">
              <EmptyState
                icon={<Wallet className="size-6" />}
                title="Belum ada pembayaran"
                description="Terima pembayaran pertama Anda"
                action={
                  <Button onClick={openCreate} className="gradient-emerald text-white">
                    <Plus className="mr-2 size-4" />
                    Terima Pembayaran
                  </Button>
                }
              />
            </Card>
          )}
        </div>
      </DataTableShell>

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Terima Pembayaran</DialogTitle>
            <DialogDescription>
              Catat penerimaan pembayaran dari siswa.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Tagihan *</Label>
              <Select value={watch("tagihanId") ?? "none"} onValueChange={handleTagihanChange}>
                <SelectTrigger><SelectValue placeholder="Pilih tagihan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Pilih tagihan</SelectItem>
                  {tagihanList?.data?.filter((t: any) => t.status !== "LUNAS").map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.siswa.nama} - {t.jenisPembayaran.nama} ({t.periode}) - Sisa {formatRupiah(t.jumlah - t.jumlahDibayar)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tagihanId && <p className="text-xs text-destructive">{errors.tagihanId.message}</p>}
              {selectedTagihan && (
                <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Tagihan</span><span className="font-semibold">{formatRupiah(selectedTagihan.jumlah)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Sudah Dibayar</span><span className="font-semibold">{formatRupiah(selectedTagihan.jumlahDibayar)}</span></div>
                  <div className="flex justify-between text-primary"><span>Sisa Tagihan</span><span className="font-bold">{formatRupiah(sisaTagihan)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge value={selectedTagihan.status} label={LABEL_STATUS_TAGIHAN[selectedTagihan.status as keyof typeof LABEL_STATUS_TAGIHAN]} /></div>
                </div>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Jumlah (Rp) *</Label>
                <Input type="number" min={1} max={sisaTagihan || undefined} {...register("jumlah")} />
                {errors.jumlah && <p className="text-xs text-destructive">{errors.jumlah.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Metode Pembayaran *</Label>
                <Select value={watch("metode")} onValueChange={(v) => setValue("metode", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(LABEL_METODE).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.metode && <p className="text-xs text-destructive">{errors.metode.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tanggal Pembayaran</Label>
              <Input type="date" {...register("tanggalBayar")} />
            </div>
            <div className="space-y-2">
              <Label>Keterangan</Label>
              <Textarea {...register("keterangan")} placeholder="Catatan tambahan" rows={2} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={mutation.isPending} className="gradient-emerald text-white">
                {mutation.isPending ? "Memproses..." : "Terima Pembayaran"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailItem} onOpenChange={(o) => !o && setDetailItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Pembayaran</DialogTitle>
          </DialogHeader>
          {detailItem && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Kode Transaksi</span><span className="font-mono font-semibold">{detailItem.kodeTransaksi}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Siswa</span><span className="font-semibold">{detailItem.tagihan?.siswa?.nama}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Jenis</span><span>{detailItem.tagihan?.jenisPembayaran?.nama}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Periode</span><span>{detailItem.tagihan?.periode}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Metode</span><span>{LABEL_METODE[detailItem.metode as keyof typeof LABEL_METODE]}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tanggal</span><span>{formatTanggalWaktu(detailItem.tanggalBayar)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Jumlah</span><span className="text-lg font-bold text-primary">{formatRupiah(detailItem.jumlah)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge value={detailItem.status} label={LABEL_STATUS_PEMBAYARAN[detailItem.status as keyof typeof LABEL_STATUS_PEMBAYARAN]} /></div>
              {detailItem.keterangan && (
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Keterangan</p>
                  <p className="text-sm">{detailItem.keterangan}</p>
                </div>
              )}
              {detailItem.buktiPembayaran && (
                <a
                  href={detailItem.buktiPembayaran}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-border p-3 text-center text-sm text-primary hover:bg-accent"
                >
                  Lihat Bukti Pembayaran
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
