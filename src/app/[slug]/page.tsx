import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import InvitationView from './InvitationView'
import { pageConfig as fallbackConfig } from '@/config/pageConfig'

interface PageProps {
  params: { slug: string }
}

/**
 * Public invitation page.
 *
 * Server component → fetches the invitation row from Supabase by slug,
 * passes its `config` JSONB (same shape as src/config/pageConfig.js) to
 * the client-side <InvitationView>, which renders via <SectionRenderer>.
 *
 * If the env vars aren't set yet (i.e. user hasn't filled .env.local),
 * we gracefully fall back to the bundled demo pageConfig so dev still
 * works out-of-the-box.
 */
export default async function Page({ params }: PageProps) {
  const { slug } = params
  const hasSupabase =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let config: any = null
  let invitationId: string | null = null

  if (hasSupabase) {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('invitations')
      .select('id, config, is_published, template_id')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      console.error('[invitation fetch]', error)
    }
    if (!data || !data.is_published) {
      // Demo slug always shows the bundled fallback so first-run dev works
      if (slug === 'rizky-amara') {
        config = fallbackConfig
      } else {
        notFound()
      }
    } else {
      // If the couple hasn't filled their config yet (empty JSON {}),
      // fall back to the demo so they see SOMETHING rather than a blank page.
      const isEmpty =
        !data.config || (typeof data.config === 'object' && Object.keys(data.config).length === 0)
      config = isEmpty ? fallbackConfig : data.config
      invitationId = (data as any).id
    }

    // Fetch guestbook notes for this invitation (newest first) and inject
    // them into the guestbook section's `initialNotes` prop so they're
    // server-rendered — no client-side loading flash.
    if (invitationId) {
      const { data: notes } = await supabase
        .from('guestbook_notes')
        .select('id, guest_name, message, color, created_at')
        .eq('invitation_id', invitationId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(200)
      config = injectGuestbookNotes(config, notes || [])
    }
  } else {
    // No Supabase configured — local dev fallback
    config = fallbackConfig
  }

  return <InvitationView config={config} slug={slug} />
}

/**
 * Find any guestbook section(s) in the config and replace their
 * `initialNotes` prop with the fresh DB rows. Returns a NEW config
 * object — does not mutate the input.
 */
function injectGuestbookNotes(config: any, dbNotes: any[]) {
  if (!config?.sections) return config
  const mapped = dbNotes.map((n) => ({
    id: n.id,
    name: n.guest_name,
    message: n.message,
    color: n.color || 'gold',
  }))
  return {
    ...config,
    sections: config.sections.map((s: any) =>
      s.type === 'guestbook'
        ? { ...s, props: { ...(s.props || {}), initialNotes: mapped } }
        : s,
    ),
  }
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: `${params.slug} — Wedding Invitation`,
    description: 'A cinematic wedding invitation',
  }
}
