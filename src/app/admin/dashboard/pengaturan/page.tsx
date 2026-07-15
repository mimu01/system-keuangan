"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, Save, Settings, Shield, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "./use-session";

const pengaturanSchema = z.object({
  nama_sekolah: z.string().optional(),
  alamat: z.string().optional(),
  telepon: z.string().optional(),
  email: z.string().optional(),
  kepala_sekolah: z.string().optional(),
  nis: z.string().optional(),
  npsn: z.string().optional(),
  website: z.string().optional(),
});

type PengaturanValues = z.infer<typeof pengaturanSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
    newPassword: z.string().min(6, "Kata sandi baru minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

export default function PengaturanPage() {
  const queryClient = useQueryClient();
  const { admin } = useSession();

  const { data, isLoading } = useQuery({
    queryKey: ["pengaturan"],
    queryFn: async () => {
      const res = await fetch("/api/pengaturan");
      if (!res.ok) throw new Error("Gagal memuat pengaturan");
      return res.json();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PengaturanValues>({
    resolver: zodResolver(pengaturanSchema),
    defaultValues: data ?? {},
    values: data,
  });

  const pengaturanMutation = useMutation({
    mutationFn: async (values: PengaturanValues) => {
      const res = await fetch("/api/pengaturan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Gagal menyimpan");
      return d;
    },
    onSuccess: () => {
      toast.success("Pengaturan berhasil disimpan");
      queryClient.invalidateQueries({ queryKey: ["pengaturan"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const passwordMutation = useMutation({
    mutationFn: async (values: PasswordValues) => {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Gagal mengganti sandi");
      return d;
    },
    onSuccess: () => {
      toast.success("Kata sandi berhasil diubah");
      passwordForm.reset();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const onSubmitPengaturan = (values: PengaturanValues) =>
    pengaturanMutation.mutate(values);

  const onSubmitPassword = (values: PasswordValues) =>
    passwordMutation.mutate(values);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan"
        description="Kelola pengaturan sekolah dan akun admin"
        icon={<Settings className="size-5" />}
      />

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        {/* School Settings */}
        <Card className="p-4 sm:p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Settings className="size-5 text-primary" />
            <h3 className="text-base font-semibold">Pengaturan Sekolah</h3>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmitPengaturan)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nama Sekolah</Label>
                  <Input {...register("nama_sekolah")} placeholder="MI Miftahul Ulum 01" />
                </div>
                <div className="space-y-2">
                  <Label>NPSN</Label>
                  <Input {...register("npsn")} placeholder="Nomor Pokok Sekolah Nasional" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>NIS</Label>
                  <Input {...register("nis")} placeholder="Nomor Induk Sekolah" />
                </div>
                <div className="space-y-2">
                  <Label>Kepala Sekolah</Label>
                  <Input {...register("kepala_sekolah")} placeholder="Nama kepala sekolah" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Telepon</Label>
                  <Input {...register("telepon")} placeholder="No telepon sekolah" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" {...register("email")} placeholder="email@sekolah.sch.id" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input {...register("website")} placeholder="www.sekolah.sch.id" />
              </div>
              <div className="space-y-2">
                <Label>Alamat</Label>
                <Input {...register("alamat")} placeholder="Alamat lengkap sekolah" />
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={pengaturanMutation.isPending}
                  className="gradient-emerald text-white"
                >
                  {pengaturanMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 size-4" />
                      Simpan Pengaturan
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Right column - Account Info & Password */}
        <div className="space-y-6">
          {/* Account Info */}
          <Card className="p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Akun Admin</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl gradient-emerald text-base font-bold text-white">
                  {admin?.nama?.[0]?.toUpperCase() ?? "A"}
                </div>
                <div>
                  <p className="font-semibold">{admin?.nama}</p>
                  <p className="text-xs text-muted-foreground">{admin?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="font-medium">{admin?.role ?? "ADMIN"}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">No HP</p>
                  <p className="font-medium">{admin?.noHp ?? "-"}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Change Password */}
          <Card className="p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <KeyRound className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Ubah Kata Sandi</h3>
            </div>
            <form
              onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Kata Sandi Saat Ini</Label>
                <Input
                  type="password"
                  {...passwordForm.register("currentPassword")}
                  placeholder="••••••••"
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Kata Sandi Baru</Label>
                <Input
                  type="password"
                  {...passwordForm.register("newPassword")}
                  placeholder="••••••••"
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Konfirmasi Kata Sandi</Label>
                <Input
                  type="password"
                  {...passwordForm.register("confirmPassword")}
                  placeholder="••••••••"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={passwordMutation.isPending}
                className="w-full gradient-emerald text-white"
              >
                {passwordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Ubah Kata Sandi"
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
