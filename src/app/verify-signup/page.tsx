'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

/**
 * /verify-signup — TOKEN-based email verification after signUp.
 *
 * User flow:
 *   1. User submits /signup → Supabase Auth creates the account + emails OTP
 *   2. Browser auto-routes here with ?email=… prefilled
 *   3. User enters the 6-digit code from the email
 *   4. Page calls supabase.auth.verifyOtp({ email, token, type: 'signup' })
 *      → that exchanges the code for an active session
 *   5. Once signed in, redirect to /onboarding to finish the 5-field wizard
 *
 * Supabase Dashboard config required:
 *   Authentication → Email Templates → "Confirm signup" →
 *   Body must include {{ .Token }} (the 6-digit code). Example:
 *
 *     <p>Kode verifikasi Anda:</p>
 *     <h2>{{ .Token }}</h2>
 *     <p>Masukkan kode ini di halaman verifikasi.</p>
 */
function VerifySignupInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const presetEmail = searchParams.get('email') || ''

  const [email, setEmail] = useState(presetEmail)
  const [token, setToken] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Email kosong')
      return
    }
    if (!token.trim()) {
      setError('Kode verifikasi kosong')
      return
    }

    setSubmitting(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { error: verifyErr } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: 'signup',
    })

    if (verifyErr) {
      setError(verifyErr.message || 'Kode salah atau sudah kadaluarsa')
      setSubmitting(false)
      return
    }

    // Email verified + session active. Send them to onboarding.
    router.push('/onboarding')
    router.refresh()
  }

  async function resendCode() {
    if (!email.trim() || resending) return
    setResending(true)
    setError(null)
    setResent(false)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { error: resendErr } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    })
    setResending(false)
    if (resendErr) {
      setError(resendErr.message || 'Gagal kirim ulang kode')
      return
    }
    setResent(true)
  }

  return (
    <main style={page}>
      <form onSubmit={onSubmit} style={card}>
        <header style={{ textAlign: 'center', marginBottom: 4 }}>
          <p style={kicker}>Verifikasi email</p>
          <h1 style={title}>Masukkan kode 6 digit</h1>
          <p style={hint}>
            Kami baru saja mengirim <b>kode 6 digit</b> ke email kamu.
            Kode berlaku 1 jam. Cek folder spam kalau tidak muncul.
          </p>
        </header>

        <label style={field}>
          <span style={label}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="kamu@example.com"
            style={input}
          />
        </label>

        <label style={field}>
          <span style={label}>Kode verifikasi</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
            required
            placeholder="123456"
            autoFocus
            style={{ ...input, fontSize: 22, letterSpacing: '0.4em', textAlign: 'center', fontFamily: 'ui-monospace, monospace' }}
          />
        </label>

        {error && <p style={errorStyle}>{error}</p>}
        {resent && !error && (
          <p style={{ ...hint, color: '#2D8C4E', margin: 0 }}>
            ✓ Kode baru sudah dikirim. Cek email kamu.
          </p>
        )}

        <button type="submit" disabled={submitting} style={primaryBtn}>
          {submitting ? 'Memverifikasi…' : 'Verifikasi & lanjutkan'}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
          <button
            type="button"
            onClick={resendCode}
            disabled={resending || !email.trim()}
            style={linkBtn}
          >
            {resending ? 'Mengirim…' : 'Kirim ulang kode'}
          </button>
          <Link href="/signup" style={{ ...linkBtn, textDecoration: 'none' }}>
            ← Ganti email
          </Link>
        </div>
      </form>
    </main>
  )
}

export default function VerifySignupPage() {
  return (
    <Suspense fallback={<main style={page}><div style={card}>Memuat…</div></main>}>
      <VerifySignupInner />
    </Suspense>
  )
}

const page: React.CSSProperties = {
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
const title: React.CSSProperties = {
  fontFamily: 'var(--font-display, serif)',
  fontStyle: 'italic',
  fontSize: 30,
  margin: 0,
  color: '#2A2118',
  lineHeight: 1.15,
}
const hint: React.CSSProperties = { color: '#5C4A3A', lineHeight: 1.6, fontSize: 14, margin: '8px 0 0' }
const field: React.CSSProperties = { display: 'grid', gap: 6 }
const label: React.CSSProperties = {
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
  width: '100%',
  boxSizing: 'border-box',
}
const primaryBtn: React.CSSProperties = {
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
const linkBtn: React.CSSProperties = {
  background: 'none',
  border: 0,
  color: '#E8553E',
  textDecoration: 'underline',
  cursor: 'pointer',
  padding: 0,
  fontSize: 13,
  fontFamily: 'inherit',
}
const errorStyle: React.CSSProperties = {
  margin: 0,
  padding: '10px 12px',
  background: 'rgba(232,85,62,0.1)',
  color: '#E8553E',
  borderRadius: 10,
  fontSize: 13,
}
