import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Groomsman } from '@/types'

/* Lazy singleton — only instantiated at runtime when env vars are available */
let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Supabase renamed "anon key" → "publishable key" in newer projects; support both
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars. Copy .env.local.example → .env.local and fill in your values.',
    )
  }

  _client = createClient(url, key)
  return _client
}

/** Convenience re-export for client components that import `supabase` directly */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

/* ── Typed DB surface (minimal) ──────────────────────────── */
export type Database = {
  public: {
    Tables: {
      groomsmen: {
        Row:    Groomsman
        Insert: Omit<Groomsman, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Groomsman, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
