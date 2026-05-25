import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

/**
 * Verify that the current request is authenticated as the OWNER of the
 * invitation identified by `slug`.
 *
 * Auth model (post-migration):
 *   - Each invitation has `owner_user_id` pointing to a row in auth.users
 *   - Session is a Supabase Auth session cookie (managed by @supabase/ssr)
 *   - User signs in with email + password OR via password reset link
 *
 * Returns the invitation row on success, null on failure. Route handlers
 * should respond 403 when null is returned.
 *
 * The function name is kept (`verifyOwnership`) so that the dozen API
 * routes and server actions that already call it don't need to change.
 */
export async function verifyOwnership(slug: string): Promise<{ id: string; owner_user_id: string } | null> {
  // 1. Who is the request from? (anon Supabase Auth session)
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 2. Look up the invitation by slug using the ADMIN client (bypasses RLS
  //    — we'll enforce ownership ourselves below). Cheaper than relying on
  //    the per-row RLS policy for the dashboard's many writes.
  const admin = createSupabaseAdminClient()
  const { data: invitation } = (await admin
    .from('invitations')
    .select('id, owner_user_id')
    .eq('slug', slug)
    .maybeSingle()) as { data: { id: string; owner_user_id: string | null } | null }

  if (!invitation) return null
  if (invitation.owner_user_id !== user.id) return null

  return { id: invitation.id, owner_user_id: user.id }
}
