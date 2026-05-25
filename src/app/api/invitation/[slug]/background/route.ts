import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { verifyOwnership } from '@/editor/lib/auth'

interface Ctx {
  params: { slug: string }
}

/**
 * PUT /api/invitation/[slug]/background
 * Body: { bgGif: string | null }
 *
 * Owner-only. Updates ONLY the `bgGif` key inside the invitation's config
 * JSONB. Mirrors the music endpoint's isolation pattern so saves from the
 * Background tab don't clash with unsaved editor state in other tabs.
 *
 *   - bgGif: '<url>'  → use this GIF
 *   - bgGif: ''       → explicitly hide the GIF layer
 *   - bgGif: null     → unset (revert to bundled default /images/wedding-animation.gif)
 */
export async function PUT(req: Request, { params }: Ctx) {
  const { slug } = params

  const owner = await verifyOwnership(slug)
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const incoming = body?.bgGif
  let sanitized: string | null
  if (incoming === null || incoming === undefined) {
    sanitized = null
  } else if (typeof incoming === 'string') {
    // Empty string is meaningful (user wants no GIF) — keep as ''
    sanitized = incoming.trim().slice(0, 600)
  } else {
    return NextResponse.json({ error: 'bgGif must be string or null' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()

  const { data: row, error: fetchErr } = await (supabase.from('invitations') as any)
    .select('config')
    .eq('id', owner.id)
    .single()

  if (fetchErr || !row) {
    console.error('[bg update fetch]', fetchErr)
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
  }

  const nextConfig = { ...(row.config || {}) }
  if (sanitized === null) {
    delete nextConfig.bgGif
  } else {
    nextConfig.bgGif = sanitized
  }

  const savedAt = new Date().toISOString()
  const { error } = await (supabase.from('invitations') as any)
    .update({ config: nextConfig, updated_at: savedAt })
    .eq('id', owner.id)

  if (error) {
    console.error('[bg update write]', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, savedAt, bgGif: sanitized })
}
