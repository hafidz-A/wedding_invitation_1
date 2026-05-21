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
  // Ensure the config has a sections array even when the DB value was null.
  const safeConfig: PageConfig = {
    meta: initialConfig?.meta ?? {},
    sections: Array.isArray(initialConfig?.sections) ? initialConfig.sections : [],
  }

  const [previewOpen, setPreviewOpen] = useState(true)

  return (
    <EditorProvider slug={slug} initialConfig={safeConfig}>
      <div style={wrap}>
        <div style={topBar}>
          <button
            type="button"
            onClick={() => setPreviewOpen((p) => !p)}
            style={previewToggle}
            title={previewOpen ? 'Hide preview pane' : 'Show preview pane'}
          >
            {previewOpen ? '◧ Hide preview' : '◨ Show preview'}
          </button>
          <SaveBar slug={slug} initialIsPublished={initialIsPublished} />
        </div>
        <div style={body}>
          <SectionList slug={slug} />
          <main style={pane}>
            <FieldEditor slug={slug} />
          </main>
          {previewOpen && <PreviewPane slug={slug} />}
        </div>
      </div>
    </EditorProvider>
  )
}

const wrap: React.CSSProperties = { display: 'grid', gridTemplateRows: 'auto 1fr', minHeight: 'calc(100vh - 200px)' }
const topBar: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0 16px', gap: 12 }
const body:  React.CSSProperties = { display: 'flex', gap: 0, background: 'rgba(255,255,255,0.55)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 12px 36px rgba(42,33,24,0.06)', minHeight: 600 }
const pane:  React.CSSProperties = { flex: 1, padding: 28, overflow: 'auto', minWidth: 0 }
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
