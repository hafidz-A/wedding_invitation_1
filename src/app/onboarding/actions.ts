'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { buildSeedConfig, validateSlug } from '@/lib/onboarding/seed-config'

export interface OnboardingInput {
  slug: string
  brideName: string
  groomName: string
  weddingDate: string // ISO datetime e.g. "2026-11-15T16:00:00"
  venue: string
}

export interface OnboardingResult {
  slug: string
  publicUrl: string
  dashboardUrl: string
}

/**
 * Create the invitation row for the currently-authenticated user.
 *
 *   - Validates the slug format (3–40 chars, lowercase + digits + hyphens).
 *   - Checks slug availability (rejects if taken by another invitation).
 *   - Refuses if this user already owns an invitation (1:1 enforcement).
 *   - Builds the full 14-section config with the couple's data substituted.
 *   - Inserts the row with is_published=true so the public URL works immediately.
 */
export async function completeOnboarding(input: OnboardingInput): Promise<OnboardingResult> {
  // 1. Require an authenticated session.
  const server = createSupabaseServerClient()
  const { data: { user } } = await server.auth.getUser()
  if (!user) throw new Error('Tidak ada sesi login — silakan daftar ulang')

  // 2. Validate inputs.
  const slug = validateSlug(input.slug)
  const brideName = input.brideName.trim()
  const groomName = input.groomName.trim()
  const venue = input.venue.trim()
  if (!brideName || !groomName) throw new Error('Nama pengantin wajib diisi')
  if (!venue) throw new Error('Lokasi acara wajib diisi')
  if (!input.weddingDate) throw new Error('Tanggal acara wajib diisi')
  const dateMs = Date.parse(input.weddingDate)
  if (isNaN(dateMs)) throw new Error('Tanggal acara tidak valid')

  const admin = createSupabaseAdminClient()

  // 3. One user owns at most one invitation (matches the auth model
  //    documented in page.tsx). Block if they already have one.
  const { data: alreadyOwned } = (await admin
    .from('invitations')
    .select('slug')
    .eq('owner_user_id', user.id)
    .maybeSingle()) as { data: { slug: string } | null }
  if (alreadyOwned?.slug) {
    return {
      slug: alreadyOwned.slug,
      publicUrl: `/${alreadyOwned.slug}`,
      dashboardUrl: `/${alreadyOwned.slug}/dashboard`,
    }
  }

  // 4. Slug availability check.
  const { data: taken } = (await admin
    .from('invitations')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()) as { data: { id: string } | null }
  if (taken) throw new Error('Slug sudah dipakai. Pilih yang lain.')

  // 5. Build the full seeded config.
  const config = buildSeedConfig({
    brideName,
    groomName,
    weddingDate: input.weddingDate,
    venue,
  })

  // 6. Insert. Several columns are legacy NOT NULL — same shape as
  //    scripts/create-invitation.mjs uses.
  //      password_hash → placeholder ('supabase-auth-migrated') during the
  //        bcrypt-to-Supabase-Auth transition. Real auth lives in
  //        auth.users. Column will be dropped from schema once migration is
  //        complete project-wide.
  //      plan          → all new signups default to "premium" since plan
  //        tiering is intentionally hidden from this onboarding flow.
  //      template_id   → start everyone on the default cinematic template.
  const { error } = await (admin.from('invitations') as any).insert({
    slug,
    owner_user_id: user.id,
    email: user.email,
    password_hash: 'supabase-auth-migrated',
    plan: 'premium',
    template_id: 'classic',
    is_published: true,
    config,
  })
  if (error) throw new Error(`Gagal membuat undangan: ${error.message}`)

  revalidatePath(`/${slug}`)
  revalidatePath(`/${slug}/dashboard`)

  return {
    slug,
    publicUrl: `/${slug}`,
    dashboardUrl: `/${slug}/dashboard`,
  }
}

/**
 * Live slug availability probe — called by the OnboardingForm as the user
 * types so they get instant feedback before submitting.
 */
export async function checkSlugAvailable(slug: string): Promise<{ available: boolean; reason?: string }> {
  try {
    const cleaned = validateSlug(slug)
    const admin = createSupabaseAdminClient()
    const { data } = (await admin
      .from('invitations')
      .select('id')
      .eq('slug', cleaned)
      .maybeSingle()) as { data: { id: string } | null }
    return data ? { available: false, reason: 'Sudah dipakai' } : { available: true }
  } catch (e) {
    return { available: false, reason: e instanceof Error ? e.message : 'Format slug tidak valid' }
  }
}
