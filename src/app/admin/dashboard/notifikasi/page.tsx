"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Bell, Plus, Send } from "lucide-react";
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
  LABEL_TIPE_NOTIFIKASI,
  formatTanggalWaktu,
} from "@/lib/types";

const LABEL_PENERIMA: Record<string, string> = {
  SEMUA: "Semua",
  WALI_MURID: "Wali Murid",
  ADMIN: "Admin",
};

const schema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  pesan: z.string().min(1, "Pesan wajib diisi"),
  tipe: z.enum(["TAGIHAN_BARU", "PEMBAYARAN_BERHASIL", "PENGUMUMAN", "JATUH_TEMPO"]),
  penerima: z.enum(["SEMUA", "WALI_MURID", "ADMIN"]).default("SEMUA"),
});

type FormValues = z.infer<typeof schema>;

export default function NotifikasiPage() {
  const [search, setSearch] = useState("");
  const [tipeFilter, setTipeFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifikasi", tipeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ tipe: tipeFilter });
      const res = await fetch(`/api/notifikasi?${params}`);
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
    defaultValues: { judul: "", pesan: "", tipe: "PENGUMUMAN", penerima: "SEMUA" },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await fetch("/api/notifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan");
      return data;
    },
    onSuccess: () => {
      toast.success("Notifikasi berhasil dikirim");
      queryClient.invalidateQueries({ queryKey: ["notifikasi"] });
      setOpen(false);
      reset();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifikasi/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal menghapus");
      }
    },
    onSuccess: () => {
      toast.success("Notifikasi dihapus");
      queryClient.invalidateQueries({ queryKey: ["notifikasi"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openCreate = () => {
    reset();
    setOpen(true);
  };

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifikasi"
        description="Kirim dan kelola notifikasi untuk pengguna"
        icon={<Bell className="size-5" />}
        actions={
          <Button onClick={openCreate} className="gradient-emerald text-white">
            <Plus className="mr-2 size-4" />
            Kirim Notifikasi
          </Button>
        }
      />

      <DataTableShell
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari notifikasi..."
        filters={
          <Select value={tipeFilter} onValueChange={setTipeFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipe" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              {Object.entries(LABEL_TIPE_NOTIFIKASI).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
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
                  <TableHead>Judul</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Penerima</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.data?.length ? (
                  data.data
                    .filter((n: any) => n.judul.toLowerCase().includes(search.toLowerCase()))
                    .map((n: any, i: number) => (
                    <motion.tr
                      key={n.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-muted/40 border-b border-border"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{n.judul}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{n.pesan}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {LABEL_TIPE_NOTIFIKASI[n.tipe as keyof typeof LABEL_TIPE_NOTIFIKASI] ?? n.tipe}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                          {LABEL_PENERIMA[n.penerima] ?? n.penerima}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatTanggalWaktu(n.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <ConfirmDelete
                          onConfirm={() => deleteMutation.mutate(n.id)}
                          description={`Hapus notifikasi "${n.judul}"?`}
                        />
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16">
                      <EmptyState
                        icon={<Bell className="size-6" />}
                        title="Belum ada notifikasi"
                        description="Kirim notifikasi pertama Anda"
                        action={
                          <Button onClick={openCreate} className="gradient-emerald text-white">
                            <Plus className="mr-2 size-4" />
                            Kirim Notifikasi
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
            <DialogTitle>Kirim Notifikasi</DialogTitle>
            <DialogDescription>
              Notifikasi akan langsung dikirim ke penerima yang dipilih.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Judul *</Label>
              <Input {...register("judul")} placeholder="Judul notifikasi" />
              {errors.judul && <p className="text-xs text-destructive">{errors.judul.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Pesan *</Label>
              <Textarea {...register("pesan")} placeholder="Isi pesan notifikasi" rows={4} />
              {errors.pesan && <p className="text-xs text-destructive">{errors.pesan.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipe *</Label>
                <Select value={watch("tipe")} onValueChange={(v) => setValue("tipe", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(LABEL_TIPE_NOTIFIKASI).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipe && <p className="text-xs text-destructive">{errors.tipe.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Penerima *</Label>
                <Select value={watch("penerima")} onValueChange={(v) => setValue("penerima", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(LABEL_PENERIMA).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.penerima && <p className="text-xs text-destructive">{errors.penerima.message}</p>}
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={mutation.isPending} className="gradient-emerald text-white">
                {mutation.isPending ? "Mengirim..." : (
                  <>
                    <Send className="mr-2 size-4" />
                    Kirim Notifikasi
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
