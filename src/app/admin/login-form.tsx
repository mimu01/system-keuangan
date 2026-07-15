"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal masuk");
        return;
      }
      toast.success(`Selamat datang, ${data.admin.nama}!`);
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left - Branding */}
      <div className="relative hidden overflow-hidden gradient-emerald lg:block">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur ring-1 ring-white/30">
              <ShieldCheck className="size-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold">SIK MI MU 01</h2>
              <p className="text-xs text-white/80">Sistem Informasi Keuangan</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6"
          >
            <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Kelola Keuangan
              <br />
              Sekolah dengan Mudah
            </h1>
            <p className="max-w-md text-base text-white/90">
              Platform terpadu untuk mengelola tagihan, pembayaran, dan laporan
              keuangan MI Miftahul Ulum 01 secara transparan dan real-time.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { label: "Siswa Aktif", value: "12+" },
                { label: "Tagihan/Digit", value: "100%" },
                { label: "Real-time", value: "Live" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/10 p-3 backdrop-blur ring-1 ring-white/20">
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-white/80">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="text-sm text-white/70">
            © {new Date().getFullYear()} MI Miftahul Ulum 01. Semua hak cipta dilindungi.
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="relative flex flex-col items-center justify-center bg-background p-6 sm:p-12">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2 text-center lg:hidden">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl gradient-emerald text-white ring-4 ring-primary/10">
              <ShieldCheck className="size-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">SIK MI Miftahul Ulum 01</h1>
            <p className="text-sm text-muted-foreground">Sistem Informasi Keuangan</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Masuk ke Akun</h2>
            <p className="text-sm text-muted-foreground">
              Silakan masukkan kredensial admin Anda untuk mengakses dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@miftahululum01.sch.id"
                  className="h-11 pl-9"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Kata Sandi
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-11 pl-9 pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full gradient-emerald text-white shadow-md transition-all hover:shadow-lg hover:brightness-105"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Akun Demo:</p>
            <p className="mt-1">Email: admin@miftahululum01.sch.id</p>
            <p>Kata Sandi: admin123</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
