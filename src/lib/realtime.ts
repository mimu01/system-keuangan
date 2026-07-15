// Helper realtime.
//
// Setelah migrasi ke Supabase, broadcast TIDAK diperlukan lagi —
// Supabase Realtime otomatis mengirim event ke semua client yang subscribe
// setiap kali data di tabel berubah (berkat publication supabase_realtime).
//
// Fungsi broadcast() tetap dipertahankan sebagai no-op agar API routes
// yang memanggilnya tidak perlu diubah. Tidak ada overhead.

export const RealtimeEvents = {
  PEMBAYARAN_CREATED: 'pembayaran:created',
  PEMBAYARAN_UPDATED: 'pembayaran:updated',
  TAGIHAN_CREATED: 'tagihan:created',
  TAGIHAN_UPDATED: 'tagihan:updated',
  NOTIFIKASI_NEW: 'notifikasi:new',
  DASHBOARD_REFRESH: 'dashboard:refresh',
  PENGELUARAN_CREATED: 'pengeluaran:created',
} as const

// No-op: Supabase Realtime menangani broadcast otomatis
export async function broadcast(_event: string, _payload: unknown): Promise<void> {
  // Sengaja kosong — perubahan DB sudah otomatis di-broadcast Supabase
  return
}
