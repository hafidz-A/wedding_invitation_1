'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { downloadCsv } from './lib/csv'

export interface GiftRow {
  id: string
  guest_name: string
  account_used: string
  amount: number | null
  currency: string | null
  message: string | null
  created_at: string
}

const fmtAmount = (n: number | null, currency: string | null) => {
  if (n == null) return '—'
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency || 'IDR',
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `${n} ${currency || ''}`.trim()
  }
}

export default function GiftsTab({ gifts }: { gifts: GiftRow[] }) {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const [refreshing, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return gifts
    return gifts.filter(
      (g) =>
        g.guest_name.toLowerCase().includes(q) ||
        g.account_used.toLowerCase().includes(q) ||
        (g.message || '').toLowerCase().includes(q),
    )
  }, [gifts, query])

  const totalAmount = gifts.reduce((sum, g) => sum + (g.amount || 0), 0)

  return (
    <div style={card}>
      <header style={headerRow}>
        <h2 style={h2}>Gift Confirmations</h2>
        <div style={actions}>
          <button
            type="button"
            onClick={() => startTransition(() => router.refresh())}
            disabled={refreshing}
            style={ghostBtn}
          >
            {refreshing ? '…' : '↻ Refresh'}
          </button>
          <button
            type="button"
            onClick={() => downloadCsv(`gifts-${new Date().toISOString().slice(0, 10)}.csv`, gifts as unknown as Record<string, unknown>[])}
            style={primaryBtn}
          >
            Download CSV
          </button>
        </div>
      </header>

      <div style={statsRow}>
        <Stat label="Confirmations" value={String(gifts.length)} />
        <Stat label="Total disclosed" value={fmtAmount(totalAmount || null, 'IDR')} accent="#E8553E" />
      </div>

      <div style={filterRow}>
        <input
          type="search"
          placeholder="Search by name, account, or note…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={searchInput}
        />
      </div>

      {gifts.length === 0 ? (
        <div style={empty}>Belum ada konfirmasi hadiah.</div>
      ) : filtered.length === 0 ? (
        <div style={empty}>Tidak ada konfirmasi yang cocok.</div>
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Account used</th>
                <th style={th}>Amount</th>
                <th style={th}>Message</th>
                <th style={th}>Received</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id}>
                  <td style={td}>{g.guest_name}</td>
                  <td style={td}>{g.account_used}</td>
                  <td style={td}>{fmtAmount(g.amount, g.currency)}</td>
                  <td style={tdMsg} title={g.message || ''}>{g.message || '—'}</td>
                  <td style={td}>{new Date(g.created_at).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, accent = '#2A2118' }: { label: string; value: string; accent?: string }) {
  return (
    <div style={statBox}>
      <p style={statLabel}>{label}</p>
      <p style={{ ...statValue, color: accent }}>{value}</p>
    </div>
  )
}

const card: React.CSSProperties = { background: 'rgba(255,255,255,0.85)', borderRadius: 18, padding: 28, boxShadow: '0 12px 36px rgba(42,33,24,0.06)' }
const headerRow: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }
const h2: React.CSSProperties = { fontFamily: 'var(--font-display, serif)', fontStyle: 'italic', fontSize: 28, margin: 0 }
const actions: React.CSSProperties = { display: 'flex', gap: 8 }
const ghostBtn: React.CSSProperties = { padding: '8px 14px', borderRadius: 999, border: '1px solid rgba(42,33,24,0.2)', background: 'transparent', cursor: 'pointer', fontSize: 12, letterSpacing: '0.1em' }
const primaryBtn: React.CSSProperties = { padding: '8px 16px', borderRadius: 999, border: 'none', background: '#2A2118', color: '#F5EFE3', cursor: 'pointer', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }
const statsRow: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }
const statBox: React.CSSProperties = { background: '#fff', borderRadius: 12, padding: 14, border: '1px solid rgba(42,33,24,0.06)' }
const statLabel: React.CSSProperties = { margin: 0, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(42,33,24,0.55)' }
const statValue: React.CSSProperties = { margin: '6px 0 0', fontFamily: 'var(--font-display, serif)', fontStyle: 'italic', fontSize: 22 }
const filterRow: React.CSSProperties = { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }
const searchInput: React.CSSProperties = { flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(42,33,24,0.16)', fontSize: 14, outline: 'none', background: '#fff' }
const empty: React.CSSProperties = { padding: 40, textAlign: 'center', color: 'rgba(42,33,24,0.5)', fontSize: 13, border: '1px dashed rgba(42,33,24,0.2)', borderRadius: 12 }
const tableWrap: React.CSSProperties = { overflow: 'auto', borderRadius: 10, border: '1px solid rgba(42,33,24,0.08)' }
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', fontSize: 13 }
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(42,33,24,0.6)', borderBottom: '1px solid rgba(42,33,24,0.1)', background: 'rgba(42,33,24,0.02)' }
const td: React.CSSProperties = { padding: '10px 12px', borderBottom: '1px solid rgba(42,33,24,0.06)', verticalAlign: 'top' }
const tdMsg: React.CSSProperties = { ...td, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
