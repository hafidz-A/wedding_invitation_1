'use server'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

/**
 * Create a new user account without sending a confirmation email.
 *
 * Uses Supabase Admin API (createUser with email_confirm: true) so the
 * account is immediately usable. This sidesteps Supabase's strict
 * built-in-SMTP rate limit on signup-confirmation emails — the trade-off
 * is that we lose proof-of-email-ownership at signup time.
 *
 * For a wedding SaaS this is acceptable: misuse incentive is low, and
 * the /forgot-password flow still requires real email ownership before
 * the user can recover their account.
 */
export interface CreateAccountResult {
  ok: boolean
  error?: string
}

export async function createAccount(
  email: string,
  password: string,
): Promise<CreateAccountResult> {
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { ok: false, error: 'Email tidak valid' }
  }
  if (!password || password.length < 8) {
    return { ok: false, error: 'Password minimal 8 karakter' }
  }

  const admin = createSupabaseAdminClient()
  const { error } = await admin.auth.admin.createUser({
    email: cleanEmail,
    password,
    email_confirm: true,
  })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
      return { ok: false, error: 'Email ini sudah terdaftar. Coba login di /login.' }
    }
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
