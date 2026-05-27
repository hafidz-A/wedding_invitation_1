'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

/**
 * Email-only OTP form — shared between /signup and /login.
 *
 * signInWithOtp() works for both:
 *   - New email   → creates auth.users row + sends OTP
 *   - Known email → just sends OTP for login
 *
 * Copy switches via the `variant` prop. After verify, the /verify-signup
 * page hands off to /onboarding which is idempotent — first-time users
 * fill the wizard, returning users get auto-redirected to /<slug>/dashboard.
 *
 * Supabase Dashboard config required:
 *   Authentication → Email Templates → "Magic Link" → body must include
 *   {{ .Token }} (the 6-digit code). Default URL-link template won't work.
 */
type Variant = 'signup' | 'login'

const COPY: Record<Variant, { kicker: string; title: string; body: string; submit: string; altPrompt: string; altLink: string; altHref: string }> = {
  signup: {
    kicker: 'Buat Undangan',
    title: 'Daftar dengan email',
    body: 'Cukup masukkan email kamu. Kami kirim kode 6 digit untuk verifikasi.',
    submit: 'Kirim kode verifikasi',
    altPrompt: 'Sudah punya akun?',
    altLink: 'Login di sini',
    altHref: '/login',
  },
  login: {
    kicker: 'Masuk',
    title: 'Login dengan email',
    body: 'Masukkan email yang kamu daftar. Kami kirim kode 6 digit untuk masuk.',
    submit: 'Kirim kode login',
    altPrompt: 'Belum punya akun?',
    altLink: 'Daftar di sini',
    altHref: '/signup',
  },
}

export default function SignupForm({ variant = 'signup' }: { variant?: Variant } = {}) {
  const copy = COPY[variant]
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Mohon isi email')
      return
    }

    setSubmitting(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        // No emailRedirectTo — we want the token flow, not the magic-link URL
      },
    })

    if (otpError) {
      const msg = otpError.message.toLowerCase()
      if (msg.includes('rate limit') || msg.includes('too many')) {
        setError(
          'Terlalu banyak permintaan email. Tunggu beberapa menit lalu coba lagi, ' +
          'atau setup custom SMTP di Supabase.',
        )
      } else {
        setError(otpError.message)
      }
      setSubmitting(false)
      return
    }

    router.push(`/verify-signup?email=${encodeURIComponent(email.trim())}`)
  }

  return (
    <main style={panel}>
      <form onSubmit={onSubmit} style={card}>
        <header style={{ marginBottom: 4 }}>
          <p style={kicker}>{copy.kicker}</p>
          <h1 style={h1}>{copy.title}</h1>
          <p style={muted}>{copy.body}</p>
        </header>

        <label style={field}>
          <span style={lbl}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            placeholder="kamu@example.com"
            style={input}
          />
        </label>

        {error && <p style={errorStyle}>{error}</p>}

        <button type="submit" disabled={submitting} style={submitBtn}>
          {submitting ? 'Mengirim kode…' : copy.submit}
        </button>

        <p style={{ ...muted, fontSize: 13, textAlign: 'center', marginTop: 14 }}>
          {copy.altPrompt}{' '}
          <Link href={copy.altHref} style={{ color: '#E8553E', textDecoration: 'underline' }}>
            {copy.altLink}
          </Link>
        </p>
        <p style={{ ...muted, fontSize: 13, textAlign: 'center', marginTop: 4 }}>
          <Link href="/" style={{ color: 'rgba(42,33,24,0.55)', textDecoration: 'underline' }}>
            ← Kembali ke beranda
          </Link>
        </p>
      </form>
    </main>
  )
}

const panel: React.CSSProperties = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  background: 'linear-gradient(135deg, #F5EFE3 0%, #E8DCC0 100%)',
  padding: 24,
  fontFamily: 'var(--font-body, system-ui)',
}
const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 440,
  padding: 36,
  background: 'rgba(255,255,255,0.95)',
  borderRadius: 20,
  boxShadow: '0 20px 60px rgba(42,33,24,0.12)',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
}
const kicker: React.CSSProperties = {
  textTransform: 'uppercase',
  letterSpacing: '0.32em',
  fontSize: 11,
  color: '#E8553E',
  margin: '0 0 8px',
}
const h1: React.CSSProperties = {
  fontFamily: 'var(--font-display, serif)',
  fontStyle: 'italic',
  fontSize: 36,
  margin: 0,
  color: '#2A2118',
  lineHeight: 1.1,
}
const muted: React.CSSProperties = {
  margin: '8px 0 0',
  color: '#5C4A3A',
  lineHeight: 1.6,
}
const field: React.CSSProperties = { display: 'grid', gap: 6 }
const lbl: React.CSSProperties = {
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  color: 'rgba(42,33,24,0.6)',
}
const input: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid rgba(42,33,24,0.18)',
  fontSize: 15,
  fontFamily: 'inherit',
}
const submitBtn: React.CSSProperties = {
  marginTop: 8,
  padding: '14px 24px',
  borderRadius: 999,
  background: '#2A2118',
  color: '#F5EFE3',
  border: 0,
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  cursor: 'pointer',
}
const errorStyle: React.CSSProperties = {
  margin: 0,
  padding: '10px 12px',
  background: 'rgba(232,85,62,0.1)',
  color: '#E8553E',
  borderRadius: 10,
  fontSize: 13,
}
