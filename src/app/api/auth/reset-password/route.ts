import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { hashPassword } from '@/lib/password'

/**
 * POST /api/auth/reset-password
 * Body: { token: string, newPassword: string }
 *
 * Validates the one-shot token, updates the invitation's password_hash, and
 * marks the token used. Returns { ok: true, slug } so the client can redirect
 * to the right dashboard login.
 *
 * Side effect: the previous session cookie's fingerprint no longer matches
 * the new hash, so existing sessions across devices are invalidated.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const token = body && typeof body.token === 'string' ? body.token : ''
  const newPassword = body && typeof body.newPassword === 'string' ? body.newPassword : ''

  if (!token || !newPassword) {
    return NextResponse.json({ error: 'Missing token or new password' }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()

  const { data: row } = (await supabase
    .from('password_reset_tokens')
    .select('token, invitation_id, expires_at, used_at')
    .eq('token', token)
    .maybeSingle()) as {
    data:
      | { token: string; invitation_id: string; expires_at: string; used_at: string | null }
      | null
  }

  if (!row) {
    return NextResponse.json({ error: 'Token tidak valid' }, { status: 400 })
  }
  if (row.used_at) {
    return NextResponse.json({ error: 'Token sudah dipakai' }, { status: 400 })
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Token kadaluwarsa, minta link baru' }, { status: 400 })
  }

  const passwordHash = await hashPassword(newPassword)

  const { data: invitation, error: updErr } = (await (supabase
    .from('invitations') as any)
    .update({ password_hash: passwordHash })
    .eq('id', row.invitation_id)
    .select('slug')
    .single()) as { data: { slug: string } | null; error: any }

  if (updErr || !invitation) {
    console.error('[reset-password] update', updErr)
    return NextResponse.json({ error: 'Gagal update password' }, { status: 500 })
  }

  // Burn the token so it can't be reused.
  await (supabase.from('password_reset_tokens') as any)
    .update({ used_at: new Date().toISOString() })
    .eq('token', token)

  return NextResponse.json({ ok: true, slug: invitation.slug })
}
