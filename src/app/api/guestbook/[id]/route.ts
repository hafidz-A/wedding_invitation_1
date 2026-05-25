import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { verifyOwnership } from '@/editor/lib/auth'

interface Ctx {
  params: { id: string }
}

/**
 * DELETE /api/guestbook/[id]
 * Query: ?slug=<slug>
 *
 * Owner-only. Verifies the per-slug session cookie, looks up the note's
 * invitation_id, and only allows delete if it matches the authenticated
 * couple's invitation. Pairs with the dashboard "Notes" tab.
 */
export async function DELETE(req: Request, { params }: Ctx) {
  const { id: noteId } = params
  const url = new URL(req.url)
  const slug = url.searchParams.get('slug') || ''

  if (!slug || !noteId) {
    return NextResponse.json({ error: 'Missing slug or note id' }, { status: 400 })
  }

  const owner = await verifyOwnership(slug)
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const supabase = createSupabaseAdminClient()

  // Confirm the note belongs to this couple's invitation BEFORE deleting,
  // so an authenticated user from invitation A can't delete a note from
  // invitation B by guessing IDs.
  const { data: note } = (await supabase
    .from('guestbook_notes')
    .select('invitation_id')
    .eq('id', noteId)
    .maybeSingle()) as { data: { invitation_id: string } | null }

  if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })
  if (note.invitation_id !== owner.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('guestbook_notes')
    .delete()
    .eq('id', noteId)

  if (error) {
    console.error('[guestbook delete]', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
