'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

/**
 * /signup — email + password + repeat. Supabase Auth signUp() sends an
 * email confirmation. All Auth emails route through the Custom SMTP
 * (Resend) configured in Supabase Dashboard → Auth → SMTP, so the rate
 * limit is the Resend quota (3000/month) rather than Supabase's 2/hour
 * built-in cap.
 *
 * After signUp succeeds, user is bounced to /verify-signup to enter the
 * 6-digit token from the email (mirrors the /forgot-password →
 * /reset-password muscle memory).
 *
 * Supabase Dashboard config required:
 *   1. Project Settings → Auth → SMTP Settings → enable Custom SMTP,
 *      point at smtp.resend.com (see CLAUDE.md / docs for exact values).
 *   2. Authentication → Email Templates → "Confirm signup" → body must
 *      include {{ .Token }} (the 6-digit code). Default template uses
 *      only {{ .ConfirmationURL }} which is the link, not the code.
 */
export default function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Mohon isi email dan password')
      return
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter')
      return
    }
    if (password !== repeat) {
      setError('Password dan ulangan password tidak sama')
      return
    }

    setSubmitting(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (signUpError) {
      const msg = signUpError.message.toLowerCase()
      if (msg.includes('already') || msg.includes('registered')) {
        setError('Email ini sudah terdaftar. Coba login di /login.')
      } else if (msg.includes('rate limit') || msg.includes('too many')) {
        setError(
          'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi, ' +
          'atau setup Custom SMTP di Supabase Dashboard.',
        )
      } else {
        setError(signUpError.message)
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
          <p style={kicker}>Buat Undangan</p>
          <h1 style={h1}>Daftar akun</h1>
          <p style={muted}>
            Buat akun untuk mulai menyusun undangan pernikahan kamu. Kami kirim
            kode 6 digit ke email untuk verifikasi.
          </p>
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

        <label style={field}>
          <span style={lbl}>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Minimal 8 karakter"
            style={input}
          />
        </label>

        <label style={field}>
          <span style={lbl}>Ulangi password</span>
          <input
            type="password"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            required
            placeholder="Sama persis dengan di atas"
            style={input}
          />
        </label>

        {error && <p style={errorStyle}>{error}</p>}

        <button type="submit" disabled={submitting} style={submitBtn}>
          {submitting ? 'Mendaftar…' : 'Daftar & kirim verifikasi'}
        </button>

        <p style={{ ...muted, fontSize: 13, textAlign: 'center', marginTop: 14 }}>
          Sudah punya akun?{' '}
          <Link href="/login" style={{ color: '#E8553E', textDecoration: 'underline' }}>
            Login di sini
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
const muted: React.CSSProperties = { margin: '8px 0 0', color: '#5C4A3A', lineHeight: 1.6 }
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
