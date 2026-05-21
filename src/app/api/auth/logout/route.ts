import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SESSION_COOKIE_PREFIX = 'wsaas_admin_'

/**
 * POST /api/auth/logout
 * Body: { slug: string }
 *
 * Clears the per-slug admin session cookie. No ownership check needed —
 * if you don't have the cookie you have nothing to clear anyway, and the
 * delete is scoped to a single slug name.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const slug = body && typeof body.slug === 'string' ? body.slug : ''
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  cookies().delete(`${SESSION_COOKIE_PREFIX}${slug}`)
  return NextResponse.json({ ok: true })
}
