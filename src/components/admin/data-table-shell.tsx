import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DataTableShellProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DataTableShell({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Cari...",
  filters,
  actions,
  children,
  className,
}: DataTableShellProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search bar - full width on mobile */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 pl-9"
        />
      </div>
      {/* Filters + actions - wrap on mobile, row on desktop */}
      {(filters || actions) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            {filters}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
