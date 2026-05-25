'use client'

import { useState } from 'react'
import { EditorProvider, type PageConfig } from './EditorProvider'
import SectionList from './SectionList'
import FieldEditor from './FieldEditor'
import SaveBar from './SaveBar'
import PreviewPane from './PreviewPane'

interface Props {
  slug: string
  initialConfig: PageConfig
  initialIsPublished: boolean
}

export default function EditorRoot({ slug, initialConfig, initialIsPublished }: Props) {
  const safeConfig: PageConfig = {
    meta: initialConfig?.meta ?? {},
    sections: Array.isArray(initialConfig?.sections) ? initialConfig.sections : [],
  }

  const [previewOpen, setPreviewOpen] = useState(true)

  return (
    <EditorProvider slug={slug} initialConfig={safeConfig}>
      <div style={wrap}>

        {/* ── Top bar ── */}
        <div style={topBar}>
          <button
            type="button"
            onClick={() => setPreviewOpen((p) => !p)}
            style={previewToggle}
            title={previewOpen ? 'Hide preview' : 'Show preview'}
          >
            {previewOpen ? '▲ Hide preview' : '▼ Show preview'}
          </button>
          <SaveBar slug={slug} initialIsPublished={initialIsPublished} />
        </div>

        {/* ── Editor row: section list + field editor ── */}
        <div style={editorRow}>
          <SectionList slug={slug} />
          <main style={fieldPane}>
            <FieldEditor slug={slug} />
          </main>
        </div>

        {/* ── Preview at bottom ── */}
        {previewOpen && <PreviewPane slug={slug} />}
      </div>
    </EditorProvider>
  )
}

const wrap: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  minHeight: 'calc(100vh - 160px)',
  background: 'rgba(255,255,255,0.55)',
  borderRadius: 18,
  overflow: 'hidden',
  boxShadow: '0 12px 36px rgba(42,33,24,0.06)',
}

const topBar: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 20px',
  borderBottom: '1px solid rgba(42,33,24,0.08)',
  gap: 12,
  background: 'rgba(255,255,255,0.8)',
  flexWrap: 'wrap',
}

const editorRow: React.CSSProperties = {
  display: 'flex',
  minHeight: 480,
  flex: 1,
}

const fieldPane: React.CSSProperties = {
  flex: 1,
  padding: 28,
  overflow: 'auto',
  minWidth: 0,
}

const previewToggle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 999,
  border: '1px solid rgba(42,33,24,0.2)',
  background: 'transparent',
  color: '#2A2118',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  cursor: 'pointer',
}
