import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconClassName?: string;
  trend?: { value: number; label: string };
  description?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  icon,
  iconClassName,
  trend,
  description,
  delay = 0,
}: StatCardProps) {
  const isPositive = trend ? trend.value >= 0 : true;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      <Card className="relative overflow-hidden p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl ring-1",
              iconClassName ?? "bg-primary/10 text-primary ring-primary/20"
            )}
          >
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold",
                isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              )}
            >
              {isPositive ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
