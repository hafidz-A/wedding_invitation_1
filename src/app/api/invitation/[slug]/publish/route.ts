import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { verifyOwnership } from '@/editor/lib/auth'

interface Ctx {
  params: { slug: string }
}

/**
 * POST /api/invitation/[slug]/publish
 * Body: { is_published: boolean }
 *
 * Owner-only. Flips the is_published flag on the invitation row.
 */
export async function POST(req: Request, { params }: Ctx) {
  const { slug } = params

  const owner = await verifyOwnership(slug)
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (typeof body?.is_published !== 'boolean') {
    return NextResponse.json({ error: 'is_published must be a boolean' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  // Cast to any at from() to avoid Supabase 'never' inference on untyped schema
  const { error } = await (supabase.from('invitations') as any)
    .update({ is_published: body.is_published, updated_at: new Date().toISOString() })
    .eq('id', owner.id)

  if (error) {
    console.error('[publish update]', error)
    return NextResponse.json({ error: 'Failed to update publish state' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, is_published: body.is_published })
}
