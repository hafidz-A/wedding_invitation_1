'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const ERRORS: Record<string, string> = {
  wrongpass: 'Password salah. Coba lagi.',
  notfound: 'Slug tidak ditemukan.',
  missing: 'Mohon isi password.',
}

export default function LoginForm({
  slug,
  loginAction,
}: {
  slug: string
  loginAction: (formData: FormData) => Promise<void>
}) {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg, #F5EFE3 0%, #E8DCC0 100%)',
        padding: 24,
        fontFamily: 'var(--font-body, system-ui)',
      }}
    >
      <form
        action={loginAction}
        style={{
          maxWidth: 420,
          width: '100%',
          padding: 40,
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 22,
          boxShadow: '0 20px 60px rgba(42,33,24,0.12)',
          display: 'grid',
          gap: 18,
        }}
      >
        <input type="hidden" name="slug" value={slug} />

        <header style={{ textAlign: 'center', marginBottom: 8 }}>
          <p
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.32em',
              fontSize: 11,
              color: '#E8553E',
              margin: '0 0 8px',
            }}
          >
            Dashboard
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontStyle: 'italic',
              fontSize: 36,
              margin: 0,
              color: '#2A2118',
            }}
          >
            Masuk untuk {slug}
          </h1>
        </header>

        <label style={{ display: 'grid', gap: 6 }}>
          <span
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              color: 'rgba(42,33,24,0.7)',
            }}
          >
            Password
          </span>
          <input
            type="password"
            name="password"
            required
            autoFocus
            placeholder="••••••••"
            style={{
              padding: '13px 16px',
              borderRadius: 10,
              border: '1px solid rgba(42,33,24,0.12)',
              fontSize: 15,
              outline: 'none',
            }}
          />
        </label>

        {error && (
          <p style={{ color: '#E8553E', fontSize: 13, margin: 0 }}>
            {ERRORS[error] || 'Terjadi kesalahan, coba lagi.'}
          </p>
        )}

        <button
          type="submit"
          style={{
            padding: '14px 24px',
            borderRadius: 999,
            background: '#2A2118',
            color: '#F5EFE3',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: 'pointer',
            marginTop: 4,
          }}
        >
          Masuk
        </button>

        <p style={{ textAlign: 'center', margin: 0 }}>
          <Link
            href="/forgot-password"
            style={{ color: '#E8553E', fontSize: 13, textDecoration: 'none' }}
          >
            Lupa password?
          </Link>
        </p>
      </form>
    </main>
  )
}
