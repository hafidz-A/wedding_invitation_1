import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour
const RESEND_API = 'https://api.resend.com/emails'

/**
 * POST /api/auth/forgot-password
 * Body: { email: string }
 *
 * Looks up an invitation by recovery email, mints a one-shot reset token,
 * stores it, and emails the reset link via Resend. Always returns 200/ok to
 * avoid leaking which emails are registered.
 *
 * In development without RESEND_API_KEY set, the response includes
 * { devMode: true, resetUrl } so you can copy-paste the link to your browser.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email =
    body && typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()

  // Find the most recent invitation for this email. (Case-insensitive — we
  // index lower(email) but the user might submit with any casing.)
  const { data: invitation } = (await supabase
    .from('invitations')
    .select('id, slug, email')
    .ilike('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()) as { data: { id: string; slug: string; email: string } | null }

  // No matching invitation — return ok anyway to avoid enumeration.
  if (!invitation) {
    return NextResponse.json({ ok: true })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString()

  const { error: insErr } = await (supabase.from('password_reset_tokens') as any)
    .insert({
      token,
      invitation_id: invitation.id,
      expires_at: expiresAt,
    })
  if (insErr) {
    console.error('[forgot-password] insert token', insErr)
    return NextResponse.json({ error: 'Failed to create reset token' }, { status: 500 })
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (req.headers.get('origin') as string) ||
    `http://${req.headers.get('host')}`
  const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${token}`

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Dev fallback: log + return URL so the developer can click through.
    console.warn(
      '[forgot-password] RESEND_API_KEY not set — returning reset URL inline:\n  ' +
        resetUrl,
    )
    return NextResponse.json({ ok: true, devMode: true, resetUrl })
  }

  const fromAddr = process.env.RESEND_FROM || 'onboarding@resend.dev'
  const emailRes = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddr,
      to: email,
      subject: 'Reset password — wedding dashboard',
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px; color:#2A2118;">
          <h2 style="font-family: Georgia, 'Cormorant Garamond', serif; font-style: italic; font-size: 28px; margin: 0 0 16px;">
            Reset password Anda
          </h2>
          <p style="line-height:1.6;">
            Anda meminta reset password untuk dashboard
            <strong>${invitation.slug}</strong>. Klik tombol di bawah untuk
            membuat password baru. Tautan ini berlaku <strong>1 jam</strong>.
          </p>
          <p style="margin: 28px 0;">
            <a href="${resetUrl}"
               style="display:inline-block; background:#2A2118; color:#F5EFE3;
                      padding:14px 26px; border-radius:999px;
                      text-decoration:none; letter-spacing:0.14em;
                      text-transform:uppercase; font-size:12px;">
              Reset password
            </a>
          </p>
          <p style="color:#666; font-size:13px; line-height:1.5;">
            Tombol tidak bekerja? Salin URL berikut ke browser:<br>
            <span style="word-break:break-all;">${resetUrl}</span>
          </p>
          <p style="color:#999; font-size:11px; margin-top:32px;">
            Tidak melakukan permintaan ini? Abaikan saja — password Anda tidak berubah.
          </p>
        </div>
      `,
    }),
  })

  if (!emailRes.ok) {
    const errBody = await emailRes.text().catch(() => '')
    console.error('[forgot-password] resend status', emailRes.status, errBody)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
