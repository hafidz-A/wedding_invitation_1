'use client'

import ThemeProvider from '@/components/ThemeProvider.jsx'
import GlobalBackground from '@/components/GlobalBackground.jsx'
// @ts-ignore — existing JSX file, types resolve at runtime
import { BotanicalBorder } from '@/components/BotanicalBorder.tsx'
import SectionRenderer from '@/renderers/SectionRenderer.jsx'
import FloatingNavbar from '@/components/FloatingNavbar.jsx'

/**
 * Client wrapper that boots all the existing wedding template components
 * with a config fetched from Supabase (or the bundled demo).
 *
 * Mirrors the original src/App.jsx + src/pages/Home.jsx composition.
 */
export default function InvitationView({ config, slug }: { config: any; slug: string }) {
  const sections = config?.sections || []

  return (
    <ThemeProvider>
      <GlobalBackground />
      <BotanicalBorder />
      <SectionRenderer config={config} slug={slug} />
      <FloatingNavbar sections={sections} />
    </ThemeProvider>
  )
}
