/**
 * Server-side Supabase client (RSC + Route Handlers + Server Actions).
 * Uses the anon key + cookie store so RLS policies still apply.
 * For ADMIN operations that need to bypass RLS, use ./admin.ts instead.
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component — Next.js disallows cookie writes.
            // Safe to ignore; middleware handles session refresh.
          }
        },
      },
    },
  )
}
