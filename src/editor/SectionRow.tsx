'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { SectionEntry } from './EditorProvider'

interface Props {
  section: SectionEntry
  label: string
  isSelected: boolean
  onSelect: () => void
  onToggleEnabled: () => void
  onRemove: () => void
}

export default function SectionRow({ section, label, isSelected, onSelect, onToggleEnabled, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    borderRadius: 10,
    background: isSelected ? 'rgba(232,85,62,0.10)' : 'transparent',
    border: isSelected ? '1px solid rgba(232,85,62,0.45)' : '1px solid transparent',
    cursor: 'pointer',
  }

  return (
    <div ref={setNodeRef} style={style} onClick={onSelect}>
      <span
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: 'grab', color: 'rgba(42,33,24,0.4)', fontSize: 14, padding: '0 4px' }}
        aria-label="Drag to reorder"
      >
        ⠿
      </span>
      <span style={{ flex: 1, fontSize: 13, color: '#2A2118' }}>{label}</span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggleEnabled() }}
        title={section.enabled === false ? 'Disabled — click to enable' : 'Enabled — click to disable'}
        style={{
          width: 12, height: 12, borderRadius: 999,
          border: 'none', cursor: 'pointer',
          background: section.enabled === false ? 'rgba(42,33,24,0.18)' : '#2D8C4E',
        }}
      />
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); if (confirm(`Remove section "${label}"?`)) onRemove() }}
        style={{ border: 'none', background: 'transparent', color: 'rgba(42,33,24,0.4)', cursor: 'pointer', fontSize: 14 }}
        aria-label="Remove section"
      >
        ×
      </button>
    </div>
  )
}
