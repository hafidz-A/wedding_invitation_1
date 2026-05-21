'use client'

import { useState } from 'react'
import { useEditor } from './EditorProvider'

interface Props {
  slug: string
}

/**
 * Right-side preview iframe. Loads the public invitation page in preview mode.
 *
 * It does NOT update on every keystroke — cinematic sections (GSAP scroll
 * triggers, motion timelines) are too heavy to re-mount on each input change.
 * Instead, the iframe re-mounts whenever `lastSavedAt` changes, so a
 * successful Save → preview refreshes automatically with the new content.
 *
 * The `?v=` cache-buster guarantees the inner page's data fetch is fresh
 * even when Next.js' server-component cache wants to reuse a recent response.
 */
export default function PreviewPane({ slug }: Props) {
  const { lastSavedAt, isDirty } = useEditor()
  const [manualRefresh, setManualRefresh] = useState(0)
  const v = `${lastSavedAt || 'init'}-${manualRefresh}`

  return (
    <aside style={wrap}>
      <header style={hdr}>
        <div>
          <p style={kicker}>Preview</p>
          {isDirty && <p style={dirtyHint}>● Unsaved changes — click Save to update</p>}
        </div>
        <button
          type="button"
          onClick={() => setManualRefresh((n) => n + 1)}
          style={refreshBtn}
          title="Refresh preview iframe"
        >
          ↻
        </button>
      </header>
      <div style={frameWrap}>
        <iframe
          key={v}
          src={`/${slug}?preview=1&v=${encodeURIComponent(v)}`}
          style={frame}
          title="Invitation preview"
        />
      </div>
    </aside>
  )
}

const wrap: React.CSSProperties = {
  width: 460,
  flexShrink: 0,
  borderLeft: '1px solid rgba(42,33,24,0.08)',
  background: '#F5EFE3',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 600,
}
const hdr: React.CSSProperties = {
  padding: '14px 18px',
  borderBottom: '1px solid rgba(42,33,24,0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
}
const kicker: React.CSSProperties = {
  margin: 0,
  fontSize: 10,
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
  color: '#E8553E',
}
const dirtyHint: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: 11,
  color: 'rgba(232,85,62,0.85)',
}
const refreshBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  border: '1px solid rgba(42,33,24,0.15)',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 16,
  lineHeight: 1,
}
const frameWrap: React.CSSProperties = { flex: 1, overflow: 'hidden', background: '#fff' }
const frame: React.CSSProperties = { width: '100%', height: '100%', border: 'none', display: 'block' }
