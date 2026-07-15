"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data dianggap segar selama 2 menit — tidak refetch otomatis
            staleTime: 2 * 60 * 1000,
            // Cache tidak di-fetch ulang saat window fokus (mencegah refetch berlebih)
            refetchOnWindowFocus: false,
            // Tidak refetch saat reconnect internet (mencegah spike request)
            refetchOnReconnect: false,
            // Retry 1x saja, tidak berlarut
            retry: 1,
            // Tidak ada polling otomatis
            refetchInterval: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
