import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let client: SupabaseClient | null = null

// Buat Supabase client hanya jika env vars tersedia
// Jika tidak ada (mis. sebelum user set anon key), return null dan app fallback ke polling
export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: { eventsPerSecond: 10 },
      },
    })
  }
  return client
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
