'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devUrl, setDevUrl] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    setDevUrl(null)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Gagal mengirim email')
        return
      }
      if (data.devMode && data.resetUrl) setDevUrl(data.resetUrl)
      setDone(true)
    } catch (err: any) {
      setError(err?.message || 'Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main style={page}>
      <div style={card}>
        <header style={{ textAlign: 'center', marginBottom: 8 }}>
          <p style={kicker}>Dashboard</p>
          <h1 style={title}>Lupa password</h1>
        </header>

        {!done ? (
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 18 }}>
            <p style={hint}>
              Masukkan email yang terdaftar saat invitation dibuat. Kami kirim tautan
              reset password yang berlaku 1 jam.
            </p>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={label}>Email</span>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                style={input}
              />
            </label>

            {error && <p style={errorStyle}>{error}</p>}

            <button type="submit" disabled={submitting} style={primaryBtn}>
              {submitting ? 'Mengirim…' : 'Kirim tautan reset'}
            </button>

            <p style={{ textAlign: 'center', margin: 0 }}>
              <Link href="/" style={linkStyle}>← Kembali ke beranda</Link>
            </p>
          </form>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            <p style={hint}>
              Jika email cocok dengan invitation di sistem kami, Anda akan menerima
              tautan reset dalam beberapa menit. Cek folder spam kalau tidak muncul.
            </p>
            {devUrl && (
              <div style={devBox}>
                <p style={{ margin: '0 0 8px', fontSize: 11, color: '#7a5a00', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
                  Dev mode (RESEND_API_KEY kosong)
                </p>
                <a href={devUrl} style={{ ...linkStyle, wordBreak: 'break-all' }}>
                  {devUrl}
                </a>
              </div>
            )}
            <button type="button" onClick={() => { setDone(false); setEmail('') }} style={ghostBtn}>
              Kirim lagi ke email lain
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

const page: React.CSSProperties = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  background: 'linear-gradient(135deg, #F5EFE3 0%, #E8DCC0 100%)',
  padding: 24,
  fontFamily: 'var(--font-body, system-ui)',
  color: '#2A2118',
}
const card: React.CSSProperties = {
  maxWidth: 460,
  width: '100%',
  padding: 40,
  background: 'rgba(255,255,255,0.94)',
  borderRadius: 22,
  boxShadow: '0 20px 60px rgba(42,33,24,0.12)',
}
const kicker: React.CSSProperties = { textTransform: 'uppercase', letterSpacing: '0.32em', fontSize: 11, color: '#E8553E', margin: '0 0 8px' }
const title: React.CSSProperties = { fontFamily: 'var(--font-display, serif)', fontStyle: 'italic', fontSize: 34, margin: 0 }
const hint: React.CSSProperties = { fontSize: 13, color: 'rgba(42,33,24,0.7)', lineHeight: 1.6, margin: 0 }
const label: React.CSSProperties = { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'rgba(42,33,24,0.7)' }
const input: React.CSSProperties = { padding: '13px 16px', borderRadius: 10, border: '1px solid rgba(42,33,24,0.16)', fontSize: 15, outline: 'none', background: '#fff' }
const errorStyle: React.CSSProperties = { color: '#E8553E', fontSize: 13, margin: 0 }
const primaryBtn: React.CSSProperties = { padding: '14px 24px', borderRadius: 999, background: '#2A2118', color: '#F5EFE3', fontSize: 12, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }
const ghostBtn: React.CSSProperties = { padding: '12px 20px', borderRadius: 999, background: 'transparent', color: '#2A2118', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid rgba(42,33,24,0.2)', cursor: 'pointer' }
const linkStyle: React.CSSProperties = { color: '#E8553E', textDecoration: 'none', fontSize: 13 }
const devBox: React.CSSProperties = { padding: 14, background: '#fef9e7', border: '1px solid #fde68a', borderRadius: 10 }
