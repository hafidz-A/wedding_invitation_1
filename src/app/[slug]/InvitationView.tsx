'use client'

import { Suspense, lazy } from 'react'
// @ts-ignore — existing JSX file, types resolve at runtime
import ThemeProvider from '@/components/ThemeProvider.jsx'
import GlobalBackground from '@/components/GlobalBackground.jsx'
// @ts-ignore — existing JSX file, types resolve at runtime
import { BotanicalBorder } from '@/components/BotanicalBorder.tsx'
import SectionRenderer from '@/renderers/SectionRenderer.jsx'
import FloatingNavbar from '@/components/FloatingNavbar.jsx'
import SmoothScroll from '@/components/SmoothScroll'

// MusicPopup is mounted as an OVERLAY when config.music.url is set —
// independent of the sections list, configured in the dashboard "Music" tab.
const MusicPopup = lazy(() => import('@/sections/MusicPopup/index.js'))

/**
 * Client wrapper that boots all the existing wedding template components
 * with a config fetched from Supabase (or the bundled demo).
 *
 * Mirrors the original src/App.jsx + src/pages/Home.jsx composition.
 */
export default function InvitationView({ config, slug }: { config: any; slug: string }) {
  const sections = config?.sections || []
  const music = config?.music
  const musicActive = music?.url && music.enabled !== false
  // config.bgGif: undefined → use default; '' → no GIF; non-empty → custom URL
  const bgGif = config?.bgGif

  return (
    <ThemeProvider theme={undefined}>
      <SmoothScroll />
      {/* @ts-ignore — gifUrl prop from JSX component */}
      <GlobalBackground gifUrl={bgGif} />
      <BotanicalBorder />
      <SectionRenderer config={config} slug={slug} />
      <FloatingNavbar sections={sections} />
      {musicActive && (
        <Suspense fallback={null}>
          <MusicPopup
            audioUrl={music.url}
            title={music.title}
            subtitle={music.subtitle}
            acceptLabel={music.acceptLabel}
            dismissLabel={music.dismissLabel}
            loop={music.loop}
          />
        </Suspense>
      )}
    </ThemeProvider>
  )
}
