'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [doneSlug, setDoneSlug] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak sama')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Gagal reset password')
        return
      }
      setDoneSlug(data.slug || '')
    } catch (err: any) {
      setError(err?.message || 'Network error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div style={card}>
        <h1 style={title}>Tautan tidak valid</h1>
        <p style={hint}>Tautan reset tidak memiliki token. Minta tautan baru dari halaman lupa password.</p>
        <Link href="/forgot-password" style={linkStyle}>Minta tautan baru →</Link>
      </div>
    )
  }

  if (doneSlug) {
    return (
      <div style={card}>
        <header style={{ textAlign: 'center', marginBottom: 8 }}>
          <p style={kicker}>Berhasil</p>
          <h1 style={title}>Password sudah diubah</h1>
        </header>
        <p style={hint}>
          Silakan login dengan password baru Anda di dashboard{' '}
          <strong>{doneSlug}</strong>.
        </p>
        <button
          type="button"
          onClick={() => router.replace(`/${doneSlug}/dashboard`)}
          style={primaryBtn}
        >
          Login ke dashboard
        </button>
      </div>
    )
  }

  return (
    <div style={card}>
      <header style={{ textAlign: 'center', marginBottom: 8 }}>
        <p style={kicker}>Dashboard</p>
        <h1 style={title}>Set password baru</h1>
      </header>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 18 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={label}>Password baru (min 6 karakter)</span>
          <input
            type="password"
            required
            minLength={6}
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={label}>Konfirmasi password</span>
          <input
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={input}
          />
        </label>

        {error && <p style={errorStyle}>{error}</p>}

        <button type="submit" disabled={submitting} style={primaryBtn}>
          {submitting ? 'Menyimpan…' : 'Set password baru'}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <main style={page}>
      <Suspense fallback={<div style={card}><p style={hint}>Loading…</p></div>}>
        <ResetPasswordInner />
      </Suspense>
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
  display: 'grid',
  gap: 16,
}
const kicker: React.CSSProperties = { textTransform: 'uppercase', letterSpacing: '0.32em', fontSize: 11, color: '#E8553E', margin: '0 0 8px' }
const title: React.CSSProperties = { fontFamily: 'var(--font-display, serif)', fontStyle: 'italic', fontSize: 32, margin: 0 }
const hint: React.CSSProperties = { fontSize: 13, color: 'rgba(42,33,24,0.7)', lineHeight: 1.6, margin: 0 }
const label: React.CSSProperties = { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'rgba(42,33,24,0.7)' }
const input: React.CSSProperties = { padding: '13px 16px', borderRadius: 10, border: '1px solid rgba(42,33,24,0.16)', fontSize: 15, outline: 'none', background: '#fff' }
const errorStyle: React.CSSProperties = { color: '#E8553E', fontSize: 13, margin: 0 }
const primaryBtn: React.CSSProperties = { padding: '14px 24px', borderRadius: 999, background: '#2A2118', color: '#F5EFE3', fontSize: 12, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }
const linkStyle: React.CSSProperties = { color: '#E8553E', textDecoration: 'none', fontSize: 13 }
