'use client'

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
  help?: string
}

export default function TextareaField({ label, value, onChange, rows = 3, help }: Props) {
  return (
    <label style={wrap}>
      <span style={lbl}>{label}</span>
      <textarea
        value={value ?? ''}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        style={textarea}
      />
      {help && <span style={hlp}>{help}</span>}
    </label>
  )
}

const wrap: React.CSSProperties = { display: 'grid', gap: 6 }
const lbl:  React.CSSProperties = { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(42,33,24,0.6)' }
const textarea: React.CSSProperties = { padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(42,33,24,0.16)', fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'vertical', background: '#fff' }
const hlp:  React.CSSProperties = { fontSize: 11, color: 'rgba(42,33,24,0.55)' }
