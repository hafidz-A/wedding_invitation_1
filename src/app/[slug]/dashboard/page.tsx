import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { verifyPassword } from '@/lib/password'
import LoginForm from './LoginForm'
import DashboardClient from './DashboardClient'

interface PageProps {
  params: { slug: string }
}

const SESSION_COOKIE_PREFIX = 'wsaas_admin_'

/**
 * Admin dashboard for a single invitation. Password-gated.
 *
 *   • Unauthenticated → renders <LoginForm> which posts the password to
 *     the loginAction server action below.
 *   • Authenticated   → renders <DashboardClient> with the invitation row.
 *
 * Auth state is a per-slug HTTP-only cookie. Each slug has its own session;
 * one couple's auth never grants access to another couple's dashboard.
 */
export default async function DashboardPage({ params }: PageProps) {
  const { slug } = params
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get(`${SESSION_COOKIE_PREFIX}${slug}`)

  const hasSupabase =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!hasSupabase) {
    return <SetupPrompt />
  }

  const supabase = createSupabaseAdminClient()
  const { data: invitation } = (await supabase
    .from('invitations')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()) as { data: any | null }

  if (!invitation) {
    return <NoSuchInvitation slug={slug} />
  }

  // Session validates against the invitation's stored hash — if the password
  // changes, all old sessions become invalid (cookie value mismatches hash).
  const isAuthed =
    !!sessionCookie?.value && sessionCookie.value === hashFingerprint(invitation.password_hash)

  if (!isAuthed) {
    return (
      <LoginForm slug={slug} loginAction={loginAction} />
    )
  }

  // Fetch RSVPs + gift confirmations for this invitation. Newest first.
  const [{ data: rsvps }, { data: gifts }] = await Promise.all([
    supabase
      .from('rsvps')
      .select('*')
      .eq('invitation_id', invitation.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('gift_confirmations')
      .select('*')
      .eq('invitation_id', invitation.id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <DashboardClient
      slug={slug}
      invitation={invitation}
      rsvps={(rsvps as any) || []}
      gifts={(gifts as any) || []}
    />
  )
}

/** Cheap derived token from the password hash — used as session value. */
function hashFingerprint(passwordHash: string): string {
  // First 32 chars of the bcrypt hash. Not secret on its own, but only
  // someone who already authenticated knows it. Bound to the HTTP-only cookie
  // and SameSite=Lax so cross-site replay isn't trivial.
  return passwordHash.slice(0, 32)
}

/**
 * Server action invoked by <LoginForm>. Verifies the submitted password
 * against the stored bcrypt hash, then sets the per-slug session cookie.
 */
async function loginAction(formData: FormData) {
  'use server'

  const slug = String(formData.get('slug') || '')
  const password = String(formData.get('password') || '')

  if (!slug || !password) {
    redirect(`/${slug}/dashboard?error=missing`)
  }

  const supabase = createSupabaseAdminClient()
  const { data } = (await supabase
    .from('invitations')
    .select('password_hash')
    .eq('slug', slug)
    .maybeSingle()) as { data: { password_hash: string } | null }

  if (!data) {
    redirect(`/${slug}/dashboard?error=notfound`)
  }

  const ok = await verifyPassword(password, data.password_hash)
  if (!ok) {
    redirect(`/${slug}/dashboard?error=wrongpass`)
  }

  cookies().set(`${SESSION_COOKIE_PREFIX}${slug}`, hashFingerprint(data.password_hash), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    // path '/' so the cookie is sent to /api/* routes too (Save, Upload, Publish).
    // Cross-slug isolation is preserved by the cookie NAME (wsaas_admin_<slug>)
    // and verifyOwnership's bcrypt-fingerprint check.
    path: '/',
    // No maxAge / expires => session cookie. Browser deletes it when the
    // browser process closes (not just the tab — closing one tab while
    // another window is open keeps the session, which is the expected
    // "session cookie" behavior).
  })
  redirect(`/${slug}/dashboard`)
}

/* ──────────── small server-rendered placeholders ──────────── */

function SetupPrompt() {
  return (
    <main style={panelStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontFamily: 'var(--font-display, serif)', fontStyle: 'italic', fontSize: 40, margin: '0 0 16px' }}>
          Setup needed
        </h1>
        <p style={{ color: '#5C4A3A', lineHeight: 1.6 }}>
          Isi <code>.env.local</code> dengan <code>NEXT_PUBLIC_SUPABASE_URL</code> dan{' '}
          <code>SUPABASE_SERVICE_ROLE_KEY</code>, lalu restart dev server.
        </p>
      </div>
    </main>
  )
}

function NoSuchInvitation({ slug }: { slug: string }) {
  return (
    <main style={panelStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontFamily: 'var(--font-display, serif)', fontStyle: 'italic', fontSize: 40, margin: '0 0 16px' }}>
          Invitation <code>{slug}</code> tidak ditemukan
        </h1>
        <p style={{ color: '#5C4A3A', lineHeight: 1.6 }}>
          Cek nama slug, atau buat row baru di tabel <code>invitations</code>.
        </p>
      </div>
    </main>
  )
}

const panelStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  background: 'linear-gradient(135deg, #F5EFE3 0%, #E8DCC0 100%)',
  padding: 40,
  fontFamily: 'var(--font-body, system-ui)',
}

const cardStyle: React.CSSProperties = {
  maxWidth: 520,
  padding: 40,
  background: 'rgba(255,255,255,0.9)',
  borderRadius: 20,
  boxShadow: '0 20px 60px rgba(42,33,24,0.12)',
}
