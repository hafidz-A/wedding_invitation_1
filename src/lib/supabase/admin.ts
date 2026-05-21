/**
 * Admin Supabase client — uses the SERVICE_ROLE key and BYPASSES RLS.
 *
 * NEVER import this from a 'use client' file or a public Route Handler
 * without your own auth check first. Use only after password verification
 * in the admin dashboard server actions.
 */
import { createClient } from '@supabase/supabase-js'

let cached: ReturnType<typeof createClient> | null = null

export function createSupabaseAdminClient() {
  if (cached) return cached
  cached = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  )
  return cached
}
