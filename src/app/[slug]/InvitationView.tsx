'use client'

import { Suspense, lazy } from 'react'
// @ts-ignore — existing JSX file, types resolve at runtime
import ThemeProvider from '@/components/ThemeProvider.jsx'
import GlobalBackground from '@/components/GlobalBackground.jsx'
// @ts-ignore — existing JSX file, types resolve at runtime
import { BotanicalBorder } from '@/components/BotanicalBorder.tsx'
import SectionRenderer from '@/renderers/SectionRenderer.jsx'
import FloatingNavbar from '@/components/FloatingNavbar.jsx'

// MusicPopup is an OVERLAY section — rendered outside the normal flow.
const MusicPopup = lazy(() => import('@/sections/MusicPopup/index.js'))

// Overlay section types — extracted from the regular sections list so they
// render as fixed/overlay elements without taking up vertical space and
// without appearing in the floating navbar.
const OVERLAY_TYPES = new Set(['musicPopup'])

/**
 * Client wrapper that boots all the existing wedding template components
 * with a config fetched from Supabase (or the bundled demo).
 *
 * Mirrors the original src/App.jsx + src/pages/Home.jsx composition.
 */
export default function InvitationView({ config, slug }: { config: any; slug: string }) {
  const allSections = config?.sections || []
  const inlineSections = allSections.filter((s: any) => !OVERLAY_TYPES.has(s.type))
  const overlaySections = allSections.filter((s: any) => OVERLAY_TYPES.has(s.type) && s.enabled !== false)

  const inlineConfig = { ...config, sections: inlineSections }

  return (
    <ThemeProvider theme={undefined}>
      <GlobalBackground />
      <BotanicalBorder />
      <SectionRenderer config={inlineConfig} slug={slug} />
      <FloatingNavbar sections={inlineSections} />
      {overlaySections.map((s: any) => {
        if (s.type === 'musicPopup') {
          return (
            <Suspense key={s.id} fallback={null}>
              <MusicPopup {...(s.props || {})} />
            </Suspense>
          )
        }
        return null
      })}
    </ThemeProvider>
  )
}
