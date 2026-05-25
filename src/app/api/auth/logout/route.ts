import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * POST /api/auth/logout
 *
 * Signs the user out of Supabase Auth (clears the auth session cookies)
 * and redirects to the home page on a non-AJAX submit.
 *
 * Accepts both:
 *   - form submit (returns 303 redirect)
 *   - fetch from client code (returns JSON)
 */
export async function POST(req: Request) {
  const supabase = createSupabaseServerClient()
  await supabase.auth.signOut()

  const accept = req.headers.get('accept') || ''
  const isJson = accept.includes('application/json')

  if (isJson) {
    return NextResponse.json({ ok: true })
  }

  // Form submit — redirect to home
  return NextResponse.redirect(new URL('/', req.url), { status: 303 })
}
