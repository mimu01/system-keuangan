"use client";

import { useEffect, useState } from "react";

type Admin = {
  id: string;
  nama: string;
  email: string;
  role: string;
  avatar?: string | null;
  noHp?: string | null;
};

export function useSession() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setAdmin(data);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { admin, loading };
}
