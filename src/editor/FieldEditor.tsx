'use client'

import { useEditor } from './EditorProvider'
import { schemaRegistry } from './schemas'
import type { FieldDef } from './schemas/types'
import TextField from './fields/TextField'
import TextareaField from './fields/TextareaField'
import DatetimeField from './fields/DatetimeField'
import BooleanField from './fields/BooleanField'
import SelectField from './fields/SelectField'
import ImageField from './fields/ImageField'
import ImageArrayField from './fields/ImageArrayField'
import ObjectArrayField from './fields/ObjectArrayField'
import AudioField from './fields/AudioField'

interface Props {
  slug: string
}

export default function FieldEditor({ slug }: Props) {
  const { selectedSection, updateField, removeSection } = useEditor()

  if (!selectedSection) {
    return <div style={empty}>Pilih section di panel kiri untuk mulai edit.</div>
  }

  const schema = schemaRegistry[selectedSection.type]
  const props = (selectedSection.props || {}) as Record<string, any>

  if (!schema) {
    return (
      <div style={fallback}>
        <header style={{ borderBottom: '1px solid rgba(42,33,24,0.08)', paddingBottom: 12, marginBottom: 16 }}>
          <p style={kicker}>Section</p>
          <h3 style={h3}>Section tidak dikenal</h3>
        </header>
        <div style={legacyCard}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <span style={legacyIcon}>⚠</span>
            <div style={{ display: 'grid', gap: 10, flex: 1 }}>
              <p style={legacyTitle}>Section <code>{selectedSection.type}</code> sudah tidak tersedia</p>
              <p style={legacyDesc}>
                Tipe section ini sudah dihapus atau dipindah ke fitur lain
                (mis. musik kini ada di tab <strong>Music</strong>). Section ini
                aman untuk dihapus — tidak ditampilkan di halaman undangan.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Hapus section "${selectedSection.type}"?`)) {
                    removeSection(selectedSection.id)
                  }
                }}
                style={legacyBtn}
              >
                Hapus section ini
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={wrap}>
      <header style={hdr}>
        <p style={kicker}>Section</p>
        <h3 style={h3}>{schema.label}</h3>
      </header>
      <div style={form}>
        {schema.fields.map((f) => renderField(f, props[f.key], (v) => updateField(selectedSection.id, f.key, v), slug))}
      </div>
    </div>
  )
}

function renderField(
  f: FieldDef,
  value: any,
  onChange: (v: unknown) => void,
  slug: string,
) {
  switch (f.type) {
    case 'text':       return <TextField     key={f.key} label={f.label} value={value ?? ''} onChange={(v) => onChange(v)} help={f.help} />
    case 'textarea':   return <TextareaField key={f.key} label={f.label} value={value ?? ''} rows={f.rows} onChange={(v) => onChange(v)} help={f.help} />
    case 'datetime':   return <DatetimeField key={f.key} label={f.label} value={value ?? ''} onChange={(v) => onChange(v)} help={f.help} />
    case 'boolean':    return <BooleanField  key={f.key} label={f.label} value={!!value} onChange={(v) => onChange(v)} help={f.help} />
    case 'select':     return <SelectField   key={f.key} label={f.label} value={value ?? ''} options={f.options} onChange={(v) => onChange(v)} help={f.help} />
    case 'image':      return <ImageField    key={f.key} label={f.label} value={value ?? ''} slug={slug} onChange={(v) => onChange(v)} help={f.help} />
    case 'audio':      return <AudioField    key={f.key} label={f.label} value={value ?? ''} slug={slug} onChange={(v) => onChange(v)} help={f.help} />
    case 'imageArray': return <ImageArrayField key={f.key} label={f.label} value={Array.isArray(value) ? value : []} slug={slug} onChange={(v) => onChange(v)} help={f.help} />
    case 'objectArray':return <ObjectArrayField
                                key={f.key}
                                label={f.label}
                                value={Array.isArray(value) ? value : []}
                                itemFields={f.itemFields}
                                newItem={f.newItem}
                                itemLabelKey={f.itemLabelKey}
                                slug={slug}
                                onChange={(v) => onChange(v)}
                              />
  }
}

const wrap: React.CSSProperties = { display: 'grid', gap: 20 }
const hdr:  React.CSSProperties = { borderBottom: '1px solid rgba(42,33,24,0.08)', paddingBottom: 12 }
const kicker:React.CSSProperties = { margin: 0, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.24em', color: '#E8553E' }
const h3:   React.CSSProperties = { margin: '4px 0 0', fontFamily: 'var(--font-display, serif)', fontStyle: 'italic', fontSize: 26 }
const form: React.CSSProperties = { display: 'grid', gap: 20, paddingBottom: 60 }
const empty:React.CSSProperties = { padding: 40, color: 'rgba(42,33,24,0.6)', fontSize: 14, textAlign: 'center' }
const fallback: React.CSSProperties = { display: 'grid', gap: 0 }
const legacyCard: React.CSSProperties = {
  padding: 20,
  background: 'rgba(232,85,62,0.06)',
  border: '1px solid rgba(232,85,62,0.18)',
  borderRadius: 14,
}
const legacyIcon: React.CSSProperties = {
  width: 36, height: 36, borderRadius: '50%',
  background: 'rgba(232,85,62,0.18)', color: '#C43F2A',
  display: 'grid', placeItems: 'center',
  fontSize: 18, fontWeight: 700, flexShrink: 0,
}
const legacyTitle: React.CSSProperties = { margin: 0, fontSize: 15, color: '#2A2118', fontWeight: 500 }
const legacyDesc: React.CSSProperties = { margin: 0, fontSize: 13, color: 'rgba(42,33,24,0.65)', lineHeight: 1.55 }
const legacyBtn: React.CSSProperties = {
  justifySelf: 'start', marginTop: 4,
  padding: '10px 18px', borderRadius: 999,
  background: '#C43F2A', color: '#fff', border: 'none',
  fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
  fontWeight: 500, cursor: 'pointer',
}
