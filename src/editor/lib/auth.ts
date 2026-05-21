import { cookies } from 'next/headers'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const SESSION_COOKIE_PREFIX = 'wsaas_admin_'

/**
 * Mirrors the auth check in src/app/[slug]/dashboard/page.tsx: the cookie
 * value is the first 32 chars of the bcrypt password_hash. We re-fetch the
 * invitation to compare and return its id when the request is authorized.
 *
 * Returns the invitation row on success, null on failure. Route handlers
 * should respond 403 when null is returned.
 */
export async function verifyOwnership(slug: string): Promise<{ id: string; password_hash: string } | null> {
  const cookieStore = cookies()
  const cookie = cookieStore.get(`${SESSION_COOKIE_PREFIX}${slug}`)
  if (!cookie?.value) return null

  const supabase = createSupabaseAdminClient()
  const { data } = (await supabase
    .from('invitations')
    .select('id, password_hash')
    .eq('slug', slug)
    .maybeSingle()) as { data: { id: string; password_hash: string } | null }

  if (!data) return null
  const fingerprint = (data.password_hash as string).slice(0, 32)
  if (cookie.value !== fingerprint) return null
  return data as { id: string; password_hash: string }
}
