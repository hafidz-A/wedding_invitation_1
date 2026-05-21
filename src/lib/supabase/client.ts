/**
 * Browser-side Supabase client.
 * Uses the anon key — RLS policies enforce what the user can see.
 * Use this in 'use client' components that need to talk to Supabase directly
 * (e.g. real-time subscriptions). For most reads/writes prefer server actions
 * + the server client (see ./server.ts).
 */
import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
