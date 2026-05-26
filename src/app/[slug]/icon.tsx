import { ImageResponse } from 'next/og'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

// Browser favicon size. Browsers will auto-scale this down to 16/32px
// for tab icons; we render at 64 for crisper rendering on retina.
export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

// Re-generate on every request — couple can change the monogram in the
// editor and see it reflected on next page load without redeploy.
// (next/og caches the binary at the CDN edge anyway, with auto-purge
//  on config save would be ideal; for now a short revalidate is fine.)
export const revalidate = 60

interface Props {
  params: { slug: string }
}

// 5 brand wreath colours — matches the rest of the site palette.
const WREATH_COLORS = [
  '#E8553E', // coral
  '#C89A1F', // gold
  '#2D8C4E', // emerald
  '#3D9BC1', // sky
  '#6B35A8', // purple
]

/**
 * Per-couple favicon — floral wreath surrounding the couple's monogram.
 *
 * Reads the monogram from the Hero section's props (where the couple
 * edits it in the dashboard). Falls back to first letters of bride +
 * groom names if monogram is empty.
 *
 *   ╭─────────────╮
 *   │ ❀  ❀  ❀     │
 *   │ ❀         ❀ │
 *   │ ❀  A & R  ❀ │
 *   │ ❀         ❀ │
 *   │ ❀  ❀  ❀     │
 *   ╰─────────────╯
 */
export default async function Icon({ params }: Props) {
  const { slug } = params

  // Default monogram if we can't load the config (offline, missing row, etc.)
  let monogram = 'A & B'

  try {
    const supabase = createSupabaseAdminClient()
    const { data } = (await supabase
      .from('invitations')
      .select('config')
      .eq('slug', slug)
      .maybeSingle()) as { data: { config: any } | null }

    if (data?.config) {
      const hero = (data.config.sections || []).find((s: any) => s.type === 'hero')
      const props = hero?.props || {}
      const explicit = typeof props.monogram === 'string' ? props.monogram.trim() : ''
      if (explicit) {
        monogram = explicit
      } else if (props.brideName && props.groomName) {
        const b = String(props.brideName).trim()[0] || '?'
        const g = String(props.groomName).trim()[0] || '?'
        monogram = `${b.toUpperCase()} & ${g.toUpperCase()}`
      }
    }
  } catch {
    // Network failure → keep default. Better to show a generic favicon
    // than fail the whole page request.
  }

  // Wreath geometry: 12 dots evenly spaced around a circle just inside
  // the viewport edge. Sizes alternate slightly for organic feel.
  const dots = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 2 * Math.PI - Math.PI / 2 // start at top
    const r = 26
    const cx = 32 + Math.cos(angle) * r
    const cy = 32 + Math.sin(angle) * r
    const dotSize = i % 3 === 0 ? 6 : i % 3 === 1 ? 4 : 5
    return {
      cx,
      cy,
      size: dotSize,
      color: WREATH_COLORS[i % WREATH_COLORS.length],
    }
  })

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#F5EFE3', // cream
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderRadius: '50%',
        }}
      >
        {/* Floral wreath dots */}
        {dots.map((d, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: d.cx - d.size / 2,
              top: d.cy - d.size / 2,
              width: d.size,
              height: d.size,
              borderRadius: '50%',
              background: d.color,
              opacity: 0.78,
            }}
          />
        ))}

        {/* Monogram in the middle */}
        <div
          style={{
            fontSize: 18,
            fontStyle: 'italic',
            color: '#2A2118',
            fontFamily: 'serif',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          {monogram}
        </div>
      </div>
    ),
    size,
  )
}
