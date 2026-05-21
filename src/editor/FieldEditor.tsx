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

interface Props {
  slug: string
}

export default function FieldEditor({ slug }: Props) {
  const { selectedSection, updateField } = useEditor()

  if (!selectedSection) {
    return <div style={empty}>Select a section on the left to start editing.</div>
  }

  const schema = schemaRegistry[selectedSection.type]
  const props = (selectedSection.props || {}) as Record<string, any>

  if (!schema) {
    return (
      <div style={fallback}>
        <h3 style={h3}>{selectedSection.type}</h3>
        <p style={{ color: 'rgba(42,33,24,0.65)', fontSize: 13 }}>
          No schema for section type <code>{selectedSection.type}</code>. Edit the raw JSON in
          Supabase if you need to change this section.
        </p>
        <pre style={pre}>{JSON.stringify(selectedSection, null, 2)}</pre>
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
const fallback: React.CSSProperties = { display: 'grid', gap: 12 }
const pre:  React.CSSProperties = { background: '#fff', padding: 14, borderRadius: 8, fontSize: 11, maxHeight: 320, overflow: 'auto' }
