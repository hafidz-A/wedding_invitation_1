'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { buildWhatsAppUrl, renderMessageTemplate } from '@/lib/guests/whatsapp'
import { formatPhoneDisplay } from '@/lib/guests/phone'
import {
  addGuest,
  deleteGuest,
  markGuestSent,
  unmarkGuestSent,
  type GuestRow,
} from './guests/actions'
import GuestImportModal from './GuestImportModal'

const DEFAULT_TEMPLATE =
  'Halo {{name}}, dengan hormat kami mengundang Anda ke acara pernikahan kami. ' +
  'Detail lengkap di sini: {{url}}'

interface Props {
  slug: string
  guests: GuestRow[]
  publicUrl: string
  messageTemplate?: string
}

export default function GuestsTab({ slug, guests, publicUrl, messageTemplate }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'sent' | 'pending'>('all')
  const [showImport, setShowImport] = useState(false)
  const [pending, startTransition] = useTransition()

  const template = messageTemplate || DEFAULT_TEMPLATE

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return guests.filter((g) => {
      if (filter === 'sent' && !g.sent_at) return false
      if (filter === 'pending' && g.sent_at) return false
      if (!q) return true
      return (
        g.name.toLowerCase().includes(q) ||
        (g.phone_e164 || '').includes(q) ||
        (g.group_label || '').toLowerCase().includes(q)
      )
    })
  }, [guests, query, filter])

  const sentCount = guests.filter((g) => g.sent_at).length
  const pendingCount = guests.length - sentCount

  const handleSend = (g: GuestRow) => {
    const message = renderMessageTemplate(template, { name: g.name, url: publicUrl })
    const url = buildWhatsAppUrl({ phoneE164: g.phone_e164, message })
    startTransition(async () => {
      try {
        await markGuestSent(slug, g.id)
      } catch (e) {
        console.error(e)
      }
      window.open(url, '_blank', 'noopener,noreferrer')
      router.refresh()
    })
  }

  const handleAdd = (form: FormData) => {
    const name = String(form.get('name') || '')
    const phoneRaw = String(form.get('phone') || '')
    if (!name.trim()) return
    startTransition(async () => {
      await addGuest(slug, { name, phoneRaw })
      router.refresh()
    })
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 24 }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>Tamu Undangan</h2>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#5C4A3A' }}>
            {guests.length} tamu · {sentCount} sudah dikirim · {pendingCount} pending
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => setShowImport(true)} style={ghostBtn}>
            + Import
          </button>
        </div>
      </header>

      <form
        action={handleAdd}
        style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}
      >
        <input name="name" placeholder="Nama tamu" required style={{ ...input, flex: '1 1 200px' }} />
        <input
          name="phone"
          placeholder="08123456789 (opsional)"
          style={{ ...input, flex: '1 1 180px' }}
        />
        <button type="submit" disabled={pending} style={primaryBtn}>
          Tambah
        </button>
      </form>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama, nomor, grup…"
          style={{ ...input, flex: 1, minWidth: 200 }}
        />
        {(['all', 'pending', 'sent'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              ...ghostBtn,
              background: filter === f ? '#2A2118' : 'transparent',
              color: filter === f ? '#fff' : '#2A2118',
            }}
          >
            {f === 'all' ? 'Semua' : f === 'pending' ? 'Belum kirim' : 'Sudah'}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(42,33,24,0.08)' }}>
              <th style={th}>Nama</th>
              <th style={th}>Nomor</th>
              <th style={th}>Status</th>
              <th style={{ ...th, textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#5C4A3A' }}>
                  Belum ada tamu. Klik <b>+ Import</b> untuk paste dari spreadsheet, atau tambah satu-satu di atas.
                </td>
              </tr>
            )}
            {filtered.map((g) => (
              <tr key={g.id} style={{ borderBottom: '1px solid rgba(42,33,24,0.04)' }}>
                <td style={td}>
                  {g.name}
                  {g.group_label && <span style={badge}>{g.group_label}</span>}
                </td>
                <td style={td}>
                  {formatPhoneDisplay(g.phone_e164) || (
                    <span style={{ color: '#aaa' }}>—</span>
                  )}
                </td>
                <td style={td}>
                  {g.sent_at ? (
                    <span
                      style={{
                        ...badge,
                        background: 'rgba(45,140,78,0.15)',
                        color: '#2D8C4E',
                      }}
                    >
                      Terkirim {new Date(g.sent_at).toLocaleDateString('id-ID')}
                    </span>
                  ) : (
                    <span
                      style={{
                        ...badge,
                        background: 'rgba(232,85,62,0.12)',
                        color: '#E8553E',
                      }}
                    >
                      Pending
                    </span>
                  )}
                </td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => handleSend(g)}
                    disabled={pending}
                    style={primaryBtn}
                  >
                    {g.phone_e164 ? 'Kirim WA' : 'Pilih kontak'}
                  </button>
                  {g.sent_at && (
                    <button
                      type="button"
                      onClick={() =>
                        startTransition(async () => {
                          await unmarkGuestSent(slug, g.id)
                          router.refresh()
                        })
                      }
                      style={{ ...ghostBtn, marginLeft: 6 }}
                      title="Batalkan status terkirim"
                    >
                      ↶
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirm(`Hapus ${g.name}?`)) return
                      startTransition(async () => {
                        await deleteGuest(slug, g.id)
                        router.refresh()
                      })
                    }}
                    style={{ ...ghostBtn, marginLeft: 6, color: '#E8553E' }}
                    title="Hapus"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showImport && (
        <GuestImportModal
          slug={slug}
          onClose={() => {
            setShowImport(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

const input: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid rgba(42,33,24,0.16)',
  borderRadius: 8,
  fontSize: 14,
}
const primaryBtn: React.CSSProperties = {
  padding: '8px 14px',
  background: '#E8553E',
  color: '#fff',
  border: 0,
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 13,
}
const ghostBtn: React.CSSProperties = {
  padding: '8px 12px',
  background: 'transparent',
  color: '#2A2118',
  border: '1px solid rgba(42,33,24,0.2)',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 13,
}
const th: React.CSSProperties = {
  padding: '10px 8px',
  fontWeight: 600,
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#5C4A3A',
}
const td: React.CSSProperties = { padding: '12px 8px', verticalAlign: 'middle' }
const badge: React.CSSProperties = {
  display: 'inline-block',
  marginLeft: 8,
  padding: '2px 8px',
  borderRadius: 999,
  fontSize: 11,
  background: 'rgba(42,33,24,0.06)',
}
