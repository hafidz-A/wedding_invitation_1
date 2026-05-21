'use client'

import { useState } from 'react'
import type { FieldDef } from '../schemas/types'
import TextField from './TextField'
import TextareaField from './TextareaField'
import DatetimeField from './DatetimeField'
import BooleanField from './BooleanField'
import SelectField from './SelectField'
import ImageField from './ImageField'

interface Props {
  label: string
  value: Record<string, unknown>[]
  itemFields: FieldDef[]
  newItem: Record<string, unknown>
  itemLabelKey?: string
  slug: string
  onChange: (next: Record<string, unknown>[]) => void
}

export default function ObjectArrayField({
  label, value, itemFields, newItem, itemLabelKey, slug, onChange,
}: Props) {
  const items = Array.isArray(value) ? value : []
  const [openIdx, setOpenIdx] = useState<number | null>(items.length === 1 ? 0 : null)

  function add() {
    const next = [...items, { ...newItem, id: `item-${Date.now()}` }]
    onChange(next)
    setOpenIdx(next.length - 1)
  }

  function remove(idx: number) {
    if (!confirm('Remove this item?')) return
    const next = items.slice()
    next.splice(idx, 1)
    onChange(next)
    setOpenIdx(null)
  }

  function move(idx: number, dir: -1 | 1) {
    const j = idx + dir
    if (j < 0 || j >= items.length) return
    const next = items.slice()
    const [it] = next.splice(idx, 1)
    next.splice(j, 0, it)
    onChange(next)
    setOpenIdx(j)
  }

  function updateItem(idx: number, key: string, val: unknown) {
    const next = items.slice()
    next[idx] = { ...next[idx], [key]: val }
    onChange(next)
  }

  return (
    <div style={wrap}>
      <div style={head}>
        <span style={lbl}>{label}</span>
        <button type="button" style={btn} onClick={add}>+ Add</button>
      </div>

      <div style={list}>
        {items.map((item, i) => {
          const headerLabel = (itemLabelKey && String(item[itemLabelKey] ?? '')) || `Item ${i + 1}`
          const open = openIdx === i
          return (
            <div key={String((item as any).id ?? i)} style={card}>
              <div style={rowHead} onClick={() => setOpenIdx(open ? null : i)}>
                <span style={chev}>{open ? '▾' : '▸'}</span>
                <span style={rowLbl}>{headerLabel || `Item ${i + 1}`}</span>
                <div style={rowBtns} onClick={(e) => e.stopPropagation()}>
                  <button type="button" style={iconBtn} onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                  <button type="button" style={iconBtn} onClick={() => move(i, +1)} disabled={i === items.length - 1}>↓</button>
                  <button type="button" style={iconBtn} onClick={() => remove(i)}>×</button>
                </div>
              </div>
              {open && (
                <div style={body}>
                  {itemFields.map((f) => {
                    const v = (item[f.key] as any) ?? defaultForField(f)
                    const onChange = (val: unknown) => updateItem(i, f.key, val)
                    switch (f.type) {
                      case 'text':     return <TextField     key={f.key} label={f.label} value={v} onChange={onChange} help={f.help} />
                      case 'textarea': return <TextareaField key={f.key} label={f.label} value={v} rows={f.rows} onChange={onChange} help={f.help} />
                      case 'datetime': return <DatetimeField key={f.key} label={f.label} value={v} onChange={onChange} help={f.help} />
                      case 'boolean':  return <BooleanField  key={f.key} label={f.label} value={v} onChange={onChange} help={f.help} />
                      case 'select':   return <SelectField   key={f.key} label={f.label} value={v} options={f.options} onChange={onChange} help={f.help} />
                      case 'image':    return <ImageField    key={f.key} label={f.label} value={v} slug={slug} onChange={onChange} help={f.help} />
                      default:
                        return <div key={f.key} style={{ fontSize: 12, color: '#E8553E' }}>Unsupported nested field: {f.type}</div>
                    }
                  })}
                </div>
              )}
            </div>
          )
        })}
        {items.length === 0 && <div style={empty}>No items yet — click + Add to create one.</div>}
      </div>
    </div>
  )
}

function defaultForField(f: FieldDef): unknown {
  switch (f.type) {
    case 'boolean': return false
    case 'text':
    case 'textarea':
    case 'datetime':
    case 'select':
    case 'image': return ''
    default: return ''
  }
}

const wrap: React.CSSProperties = { display: 'grid', gap: 10 }
const head: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10 }
const lbl:  React.CSSProperties = { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(42,33,24,0.6)', flex: 1 }
const btn:  React.CSSProperties = { padding: '6px 12px', borderRadius: 999, background: '#2A2118', color: '#F5EFE3', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }
const list: React.CSSProperties = { display: 'grid', gap: 8 }
const card: React.CSSProperties = { border: '1px solid rgba(42,33,24,0.12)', borderRadius: 10, background: '#fff' }
const rowHead: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', userSelect: 'none' }
const chev: React.CSSProperties = { color: 'rgba(42,33,24,0.5)', width: 14 }
const rowLbl: React.CSSProperties = { flex: 1, fontSize: 13, color: '#2A2118', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
const rowBtns: React.CSSProperties = { display: 'flex', gap: 4 }
const iconBtn: React.CSSProperties = { width: 28, height: 28, borderRadius: 6, background: 'transparent', border: '1px solid rgba(42,33,24,0.15)', cursor: 'pointer', fontSize: 13 }
const body: React.CSSProperties = { display: 'grid', gap: 14, padding: '4px 14px 16px', borderTop: '1px solid rgba(42,33,24,0.08)' }
const empty:React.CSSProperties = { padding: 18, textAlign: 'center', color: 'rgba(42,33,24,0.5)', fontSize: 13, border: '1px dashed rgba(42,33,24,0.2)', borderRadius: 10 }
