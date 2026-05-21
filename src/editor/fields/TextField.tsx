'use client'

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
  help?: string
}

export default function TextField({ label, value, onChange, help }: Props) {
  return (
    <label style={wrap}>
      <span style={lbl}>{label}</span>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        style={input}
      />
      {help && <span style={hlp}>{help}</span>}
    </label>
  )
}

const wrap: React.CSSProperties = { display: 'grid', gap: 6 }
const lbl:  React.CSSProperties = { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(42,33,24,0.6)' }
const input:React.CSSProperties = { padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(42,33,24,0.16)', fontSize: 14, outline: 'none', background: '#fff' }
const hlp:  React.CSSProperties = { fontSize: 11, color: 'rgba(42,33,24,0.55)' }
