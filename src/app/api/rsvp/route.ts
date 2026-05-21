import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/rsvp
 * Body: { slug, guest_name, attending, guest_count, meal_choice?, message? }
 *
 * Uses the admin (service_role) client so RLS bypass is intentional —
 * we want guests to submit RSVPs without auth, but ONLY for their own
 * invitation. Slug is resolved here on the server, never trusted from
 * the client.
 */
export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { slug, guest_name, attending, guest_count, meal_choice, message } = body || {}

  if (!slug || !guest_name || typeof attending !== 'boolean') {
    return NextResponse.json(
      { error: 'Missing required fields: slug, guest_name, attending' },
      { status: 400 },
    )
  }

  const supabase = createSupabaseAdminClient()

  // Resolve slug → invitation_id server-side
  const { data: invitation, error: invErr } = await supabase
    .from('invitations')
    .select('id, is_published')
    .eq('slug', slug)
    .maybeSingle()

  if (invErr || !invitation) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
  }
  if (!invitation.is_published) {
    return NextResponse.json({ error: 'Invitation not published' }, { status: 403 })
  }

  const { error } = await supabase.from('rsvps').insert({
    invitation_id: invitation.id,
    guest_name: String(guest_name).slice(0, 120),
    attending,
    guest_count: Math.min(20, Math.max(1, Number(guest_count) || 1)),
    meal_choice: meal_choice ? String(meal_choice).slice(0, 80) : null,
    message: message ? String(message).slice(0, 500) : null,
  })

  if (error) {
    console.error('[rsvp insert]', error)
    return NextResponse.json({ error: 'Failed to record RSVP' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
