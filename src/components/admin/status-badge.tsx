import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "destructive" | "outline";

const colorMap: Record<string, string> = {
  // Status tagihan
  LUNAS: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  BELUM_BAYAR: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
  SEBAGIAN: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  // Status pembayaran
  BERHASIL: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  GAGAL: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
  DITOLAK: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
  // Status siswa
  AKTIF: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  LULUS: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  PINDAH: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  NONAKTIF: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:text-zinc-400",
  // Aktif / Tidak Aktif
  "true": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  "false": "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:text-zinc-400",
};

export function StatusBadge({
  value,
  label,
  variant = "outline",
  className,
}: {
  value: string;
  label?: string;
  variant?: Variant;
  className?: string;
}) {
  const colorClass = colorMap[value] ?? colorMap[label ?? ""] ?? "";
  return (
    <Badge
      variant={variant}
      className={cn(
        "rounded-full font-medium",
        colorClass,
        className
      )}
    >
      {label ?? value}
    </Badge>
  );
}
