'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

/**
 * /reset-password — set a new password after clicking the email link.
 *
 * Supabase Auth's reset-password email links to this page with the
 * recovery tokens in the URL FRAGMENT (#access_token=...&type=recovery).
 * The Supabase JS SDK detects the fragment automatically on mount and
 * establishes a recovery-mode session. We then just need to call
 * `supabase.auth.updateUser({ password })`.
 *
 * No custom token table or backend endpoint needed.
 */
function ResetPasswordInner() {
  const router = useRouter()

  const [ready, setReady] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  // On mount, the SDK reads the recovery tokens from the URL hash
  // (#access_token=...&type=recovery) and sets a session. We listen
  // for the PASSWORD_RECOVERY event to confirm we're in recovery mode.
  useEffect(() => {
    let mounted = true
    supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setHasSession(true)
      }
      setReady(true)
    })

    // Fallback: check current session synchronously in case the event
    // already fired before we mounted (e.g. tab restored).
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      if (data.session) setHasSession(true)
      setReady(true)
    })

    return () => { mounted = false }
  }, [supabase])

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

    const { error: updErr } = await supabase.auth.updateUser({ password })
    if (updErr) {
      setError(updErr.message || 'Gagal reset password')
      setSubmitting(false)
      return
    }

    // Look up the user's invitation slug so we can deep-link them back
    // to their dashboard after success.
    const { data: { user } } = await supabase.auth.getUser()
    let slug = ''
    if (user) {
      const { data: invitation } = await supabase
        .from('invitations')
        .select('slug')
        .eq('owner_user_id', user.id)
        .maybeSingle()
      slug = (invitation as any)?.slug || ''
    }

    setDone(true)
    setSubmitting(false)

    if (slug) {
      // Already signed in via the recovery session — go straight to dashboard
      setTimeout(() => router.replace(`/${slug}/dashboard`), 1200)
    }
  }

  if (!ready) {
    return (
      <div style={card}>
        <p style={hint}>Loading…</p>
      </div>
    )
  }

  if (!hasSession) {
    return (
      <div style={card}>
        <h1 style={title}>Tautan tidak valid atau kadaluarsa</h1>
        <p style={hint}>
          Link reset password sudah tidak aktif (kadaluarsa atau pernah dipakai).
          Minta link baru dari halaman lupa password.
        </p>
        <Link href="/forgot-password" style={linkStyle}>Minta tautan baru →</Link>
      </div>
    )
  }

  if (done) {
    return (
      <div style={card}>
        <header style={{ textAlign: 'center', marginBottom: 8 }}>
          <p style={kicker}>Berhasil</p>
          <h1 style={title}>Password sudah diubah</h1>
        </header>
        <p style={hint}>
          Kamu sudah otomatis login. Mengarahkan ke dashboard…
        </p>
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
  padding: 'clamp(24px, 6vw, 40px)',
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
