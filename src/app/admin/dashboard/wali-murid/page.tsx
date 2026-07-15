"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Pencil, Plus, UsersRound } from "lucide-react";
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

const schema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  noHp: z.string().optional(),
  alamat: z.string().optional(),
  pekerjaan: z.string().optional(),
  hubungan: z.string().min(1, "Hubungan wajib diisi").default("Orang Tua"),
  siswaId: z.string().min(1, "Siswa wajib dipilih"),
});

type FormValues = z.infer<typeof schema>;

export default function WaliMuridPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["wali-murid", search],
    queryFn: async () => {
      const res = await fetch(`/api/wali-murid?search=${encodeURIComponent(search)}`);
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
      email: "",
      noHp: "",
      alamat: "",
      pekerjaan: "",
      hubungan: "Orang Tua",
      siswaId: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = editingId ? `/api/wali-murid/${editingId}` : "/api/wali-murid";
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
      toast.success(editingId ? "Data wali murid diperbarui" : "Wali murid ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["wali-murid"] });
      setOpen(false);
      reset();
      setEditingId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/wali-murid/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal menghapus");
      }
    },
    onSuccess: () => {
      toast.success("Data wali murid dihapus");
      queryClient.invalidateQueries({ queryKey: ["wali-murid"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openCreate = () => {
    reset();
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (w: any) => {
    setEditingId(w.id);
    setValue("nama", w.nama);
    setValue("email", w.email);
    setValue("noHp", w.noHp ?? "");
    setValue("alamat", w.alamat ?? "");
    setValue("pekerjaan", w.pekerjaan ?? "");
    setValue("hubungan", w.hubungan);
    setValue("siswaId", w.siswaId);
    setOpen(true);
  };

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wali Murid"
        description="Daftar orang tua / wali murid siswa"
        icon={<UsersRound className="size-5" />}
        actions={
          <Button onClick={openCreate} className="gradient-emerald text-white">
            <Plus className="mr-2 size-4" />
            Tambah Wali Murid
          </Button>
        }
      />

      <DataTableShell
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama, email, no HP..."
      >
        <Card className="overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>No HP</TableHead>
                  <TableHead>Pekerjaan</TableHead>
                  <TableHead>Hubungan</TableHead>
                  <TableHead>Siswa</TableHead>
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
                  data.data.map((w: any, i: number) => (
                    <motion.tr
                      key={w.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-muted/40 border-b border-border"
                    >
                      <TableCell className="font-medium">{w.nama}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{w.email}</TableCell>
                      <TableCell className="text-sm">{w.noHp ?? "-"}</TableCell>
                      <TableCell className="text-sm">{w.pekerjaan ?? "-"}</TableCell>
                      <TableCell>
                        <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {w.hubungan}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{w.siswa?.nama ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(w)}>
                            <Pencil className="size-4" />
                          </Button>
                          <ConfirmDelete
                            onConfirm={() => deleteMutation.mutate(w.id)}
                            description={`Hapus wali murid ${w.nama}?`}
                          />
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16">
                      <EmptyState
                        icon={<UsersRound className="size-6" />}
                        title="Belum ada wali murid"
                        description="Tambahkan data wali murid pertama Anda"
                        action={
                          <Button onClick={openCreate} className="gradient-emerald text-white">
                            <Plus className="mr-2 size-4" />
                            Tambah Wali Murid
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
            data.data.map((w: any, i: number) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate font-semibold">{w.nama}</p>
                      <p className="truncate text-xs text-muted-foreground">{w.email}</p>
                      {w.noHp && <p className="text-xs text-muted-foreground">HP: {w.noHp}</p>}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {w.hubungan}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs">{w.siswa?.nama ?? "-"}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(w)}>
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmDelete
                        onConfirm={() => deleteMutation.mutate(w.id)}
                        description={`Hapus wali murid ${w.nama}?`}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="p-8">
              <EmptyState
                icon={<UsersRound className="size-6" />}
                title="Belum ada wali murid"
                description="Tambahkan data wali murid pertama Anda"
                action={
                  <Button onClick={openCreate} className="gradient-emerald text-white">
                    <Plus className="mr-2 size-4" />
                    Tambah Wali Murid
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
            <DialogTitle>{editingId ? "Edit Wali Murid" : "Tambah Wali Murid"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Perbarui informasi wali murid." : "Lengkapi data wali murid."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Lengkap *</Label>
              <Input {...register("nama")} placeholder="Nama wali murid" />
              {errors.nama && <p className="text-xs text-destructive">{errors.nama.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" {...register("email")} placeholder="email@contoh.com" />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>No HP</Label>
                <Input {...register("noHp")} placeholder="08xxxxxxxxxx" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Pekerjaan</Label>
                <Input {...register("pekerjaan")} placeholder="Pekerjaan" />
              </div>
              <div className="space-y-2">
                <Label>Hubungan *</Label>
                <Select value={watch("hubungan")} onValueChange={(v) => setValue("hubungan", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Orang Tua">Orang Tua</SelectItem>
                    <SelectItem value="Wali">Wali</SelectItem>
                    <SelectItem value="Kakek">Kakek</SelectItem>
                    <SelectItem value="Nenek">Nenek</SelectItem>
                    <SelectItem value="Paman">Paman</SelectItem>
                    <SelectItem value="Bibi">Bibi</SelectItem>
                    <SelectItem value="Kakak">Kakak</SelectItem>
                  </SelectContent>
                </Select>
                {errors.hubungan && <p className="text-xs text-destructive">{errors.hubungan.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Siswa *</Label>
              <Select value={watch("siswaId") ?? "none"} onValueChange={(v) => setValue("siswaId", v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Pilih siswa" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Pilih siswa</SelectItem>
                  {siswaList?.data?.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nama} {s.nis ? `(${s.nis})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.siswaId && <p className="text-xs text-destructive">{errors.siswaId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Alamat</Label>
              <Textarea {...register("alamat")} placeholder="Alamat lengkap" rows={2} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={mutation.isPending} className="gradient-emerald text-white">
                {mutation.isPending ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Wali Murid"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
