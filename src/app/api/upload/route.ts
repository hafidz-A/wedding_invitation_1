import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

const SESSION_COOKIE_PREFIX = 'wsaas_admin_'
const BUCKET = 'invitation-media'
const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

/**
 * POST /api/upload (multipart)
 * Form fields:
 *   - file: File
 *   - slug: string
 *
 * Verifies the per-slug session cookie owns the invitation, resolves it to
 * an id, and uploads to invitation-media/<id>/<timestamp>-<safe-name>.<ext>.
 * Returns the public URL.
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })

  const slug = String(form.get('slug') || '')
  const file = form.get('file')
  if (!slug || !(file instanceof File)) {
    return NextResponse.json({ error: 'Missing slug or file' }, { status: 400 })
  }

  // --- ownership check (inline; this route does not import @/editor to keep
  //     the api boundary independent of the editor namespace) ---
  const cookie = cookies().get(`${SESSION_COOKIE_PREFIX}${slug}`)
  if (!cookie?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const supabase = createSupabaseAdminClient()
  const { data: invitation } = (await supabase
    .from('invitations')
    .select('id, password_hash')
    .eq('slug', slug)
    .maybeSingle()) as { data: { id: string; password_hash: string } | null }
  if (!invitation) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (cookie.value !== invitation.password_hash.slice(0, 32)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // --- validate ---
  if (!ALLOWED_MIMES.has(file.type)) {
    return NextResponse.json({ error: `Unsupported mime: ${file.type}` }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 })
  }

  // --- upload ---
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-60)
  const path = `${invitation.id}/${Date.now()}-${safeName}`
  const bytes = new Uint8Array(await file.arrayBuffer())

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false })
  if (upErr) {
    console.error('[upload]', upErr)
    return NextResponse.json({ error: upErr.message || 'Upload failed' }, { status: 500 })
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return NextResponse.json({ ok: true, url: pub.publicUrl, path })
}
