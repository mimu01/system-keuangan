"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownCircle,
  Bell,
  CalendarDays,
  FileBarChart,
  GraduationCap,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  School,
  ScrollText,
  Settings,
  ShieldCheck,
  Tags,
  UsersRound,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRealtime } from "@/hooks/use-realtime";
import { useQueryClient } from "@tanstack/react-query";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Data Siswa", href: "/admin/dashboard/siswa", icon: GraduationCap },
  { label: "Wali Murid", href: "/admin/dashboard/wali-murid", icon: UsersRound },
  { label: "Data Kelas", href: "/admin/dashboard/kelas", icon: School },
  { label: "Jenis Pembayaran", href: "/admin/dashboard/jenis-pembayaran", icon: Tags },
  { label: "Tagihan", href: "/admin/dashboard/tagihan", icon: ReceiptText },
  { label: "Pembayaran", href: "/admin/dashboard/pembayaran", icon: Wallet },
  { label: "Pengeluaran", href: "/admin/dashboard/pengeluaran", icon: ArrowDownCircle },
  { label: "Laporan", href: "/admin/dashboard/laporan", icon: FileBarChart },
  { label: "Tahun Ajaran", href: "/admin/dashboard/tahun-ajaran", icon: CalendarDays },
  { label: "Notifikasi", href: "/admin/dashboard/notifikasi", icon: Bell },
  { label: "Activity Log", href: "/admin/dashboard/activity-log", icon: History },
  { label: "Pengaturan", href: "/admin/dashboard/pengaturan", icon: Settings },
];

type Admin = {
  id: string;
  nama: string;
  email: string;
  role: string;
  avatar?: string | null;
  noHp?: string | null;
};

export function DashboardShell({
  admin,
  children,
}: {
  admin: Admin;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const queryClient = useQueryClient();

  // Realtime: invalidate queries on broadcast events
  useRealtime(
    [
      "dashboard:refresh",
      "pembayaran:created",
      "pembayaran:updated",
      "tagihan:created",
      "tagihan:updated",
      "pengeluaran:created",
      "notifikasi:new",
    ],
    (event) => {
      queryClient.invalidateQueries();
      if (event === "pembayaran:created") {
        toast.info("Pembayaran baru diterima", {
          description: "Data pembayaran telah diperbarui",
        });
      } else if (event === "notifikasi:new") {
        toast.info("Notifikasi baru", {
          description: "Pemberitahuan baru telah dikirim",
        });
      }
    }
  );

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Berhasil keluar");
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error("Gagal keluar");
    }
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-10 items-center justify-center rounded-xl gradient-emerald text-white shadow-md">
          <ShieldCheck className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold">SIK MI MU 01</p>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "gradient-emerald text-white shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-5 py-4">
        <p className="text-xs font-medium text-foreground">MI Miftahul Ulum 01</p>
        <p className="text-xs text-muted-foreground">Versi 1.0.0 · © 2024</p>
      </div>
    </div>
  );

  const initials = admin.nama
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar lg:flex lg:flex-col">
        {SidebarContent}
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-md sm:h-16 sm:px-6 sm:gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Buka menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-xs p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu Navigasi</SheetTitle>
              </SheetHeader>
              {SidebarContent}
            </SheetContent>
          </Sheet>

          <div className="flex-1 min-w-0">
            <h2 className="truncate text-sm font-semibold text-foreground sm:text-base">
              {navItems.find((n) =>
                n.href === "/admin/dashboard"
                  ? pathname === n.href
                  : pathname.startsWith(n.href)
              )?.label ?? "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 rounded-full px-1.5 py-1 hover:bg-accent sm:px-2"
                >
                  <Avatar className="size-8 ring-1 ring-border">
                    <AvatarFallback className="gradient-emerald text-xs font-bold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left md:block">
                    <p className="text-xs font-semibold leading-tight">
                      {admin.nama}
                    </p>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {admin.email}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold">{admin.nama}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {admin.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard/pengaturan" className="cursor-pointer">
                    <Settings className="mr-2 size-4" />
                    Pengaturan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard/activity-log" className="cursor-pointer">
                    <ScrollText className="mr-2 size-4" />
                    Activity Log
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 size-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mx-auto w-full max-w-7xl p-3 sm:p-6 lg:p-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
