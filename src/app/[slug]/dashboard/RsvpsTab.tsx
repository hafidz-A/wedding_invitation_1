'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { downloadCsv } from './lib/csv'

export interface RsvpRow {
  id: string
  guest_name: string
  attending: boolean
  guest_count: number | null
  meal_choice: string | null
  message: string | null
  created_at: string
}

export default function RsvpsTab({ rsvps }: { rsvps: RsvpRow[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'yes' | 'no'>('all')
  const router = useRouter()
  const [refreshing, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return rsvps.filter((r) => {
      if (filter === 'yes' && !r.attending) return false
      if (filter === 'no' && r.attending) return false
      if (!q) return true
      return (
        r.guest_name.toLowerCase().includes(q) ||
        (r.meal_choice || '').toLowerCase().includes(q) ||
        (r.message || '').toLowerCase().includes(q)
      )
    })
  }, [rsvps, query, filter])

  const yesCount = rsvps.filter((r) => r.attending).length
  const noCount = rsvps.length - yesCount
  const totalGuests = rsvps
    .filter((r) => r.attending)
    .reduce((sum, r) => sum + (r.guest_count || 1), 0)

  return (
    <div style={card}>
      <header style={headerRow}>
        <h2 style={h2}>RSVPs</h2>
        <div style={actions}>
          <button
            type="button"
            onClick={() => startTransition(() => router.refresh())}
            disabled={refreshing}
            style={ghostBtn}
            title="Refetch from Supabase"
          >
            {refreshing ? '…' : '↻ Refresh'}
          </button>
          <button
            type="button"
            onClick={() => downloadCsv(`rsvps-${new Date().toISOString().slice(0, 10)}.csv`, rsvps as unknown as Record<string, unknown>[])}
            style={primaryBtn}
          >
            Download CSV
          </button>
        </div>
      </header>

      <div style={statsRow}>
        <Stat label="Responses" value={String(rsvps.length)} />
        <Stat label="Attending" value={String(yesCount)} accent="#2D8C4E" />
        <Stat label="Declined" value={String(noCount)} accent="#999" />
        <Stat label="Est. guests" value={String(totalGuests)} accent="#E8553E" />
      </div>

      <div style={filterRow}>
        <input
          type="search"
          placeholder="Search by name, meal, or note…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={searchInput}
        />
        <div style={tabs}>
          {(['all', 'yes', 'no'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={filter === f ? tabActive : tabBtn}
            >
              {f === 'all' ? 'All' : f === 'yes' ? 'Attending' : 'Declined'}
            </button>
          ))}
        </div>
      </div>

      {rsvps.length === 0 ? (
        <div style={empty}>Belum ada RSVP. Tamu yang submit form akan muncul di sini.</div>
      ) : filtered.length === 0 ? (
        <div style={empty}>Tidak ada RSVP yang cocok dengan filter.</div>
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Attending</th>
                <th style={th}>Guests</th>
                <th style={th}>Meal</th>
                <th style={th}>Message</th>
                <th style={th}>Received</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={td}>{r.guest_name}</td>
                  <td style={td}>
                    <span style={r.attending ? pillYes : pillNo}>
                      {r.attending ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={td}>{r.attending ? r.guest_count ?? 1 : '—'}</td>
                  <td style={td}>{r.meal_choice || '—'}</td>
                  <td style={tdMsg} title={r.message || ''}>{r.message || '—'}</td>
                  <td style={td}>{new Date(r.created_at).toLocaleString('id-ID')}</td>
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
const statsRow: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 20 }
const statBox: React.CSSProperties = { background: '#fff', borderRadius: 12, padding: 14, border: '1px solid rgba(42,33,24,0.06)' }
const statLabel: React.CSSProperties = { margin: 0, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(42,33,24,0.55)' }
const statValue: React.CSSProperties = { margin: '6px 0 0', fontFamily: 'var(--font-display, serif)', fontStyle: 'italic', fontSize: 26 }
const filterRow: React.CSSProperties = { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }
const searchInput: React.CSSProperties = { flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(42,33,24,0.16)', fontSize: 14, outline: 'none', background: '#fff' }
const tabs: React.CSSProperties = { display: 'flex', gap: 4, background: 'rgba(42,33,24,0.06)', borderRadius: 999, padding: 4 }
const tabBtn: React.CSSProperties = { padding: '6px 14px', borderRadius: 999, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, color: 'rgba(42,33,24,0.65)' }
const tabActive: React.CSSProperties = { ...tabBtn, background: '#fff', color: '#2A2118', fontWeight: 500 }
const empty: React.CSSProperties = { padding: 40, textAlign: 'center', color: 'rgba(42,33,24,0.5)', fontSize: 13, border: '1px dashed rgba(42,33,24,0.2)', borderRadius: 12 }
const tableWrap: React.CSSProperties = { overflow: 'auto', borderRadius: 10, border: '1px solid rgba(42,33,24,0.08)' }
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', fontSize: 13 }
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(42,33,24,0.6)', borderBottom: '1px solid rgba(42,33,24,0.1)', background: 'rgba(42,33,24,0.02)' }
const td: React.CSSProperties = { padding: '10px 12px', borderBottom: '1px solid rgba(42,33,24,0.06)', verticalAlign: 'top' }
const tdMsg: React.CSSProperties = { ...td, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
const pillYes: React.CSSProperties = { padding: '3px 10px', borderRadius: 999, background: '#E0F2E5', color: '#2D8C4E', fontSize: 11, fontWeight: 500 }
const pillNo: React.CSSProperties = { padding: '3px 10px', borderRadius: 999, background: 'rgba(42,33,24,0.08)', color: 'rgba(42,33,24,0.6)', fontSize: 11, fontWeight: 500 }
