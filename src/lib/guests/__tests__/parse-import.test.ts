import { describe, it, expect } from 'vitest'
import { parseGuestImport } from '../parse-import'

describe('parseGuestImport', () => {
  it('parses name only (no tab)', () => {
    const out = parseGuestImport('Agus Salim')
    expect(out).toEqual([{ name: 'Agus Salim', phoneE164: null, lineNo: 1 }])
  })

  it('parses name + phone (tab-separated)', () => {
    const out = parseGuestImport('Agus Salim\t081234567890')
    expect(out).toEqual([{ name: 'Agus Salim', phoneE164: '6281234567890', lineNo: 1 }])
  })

  it('keeps comma-bearing names intact', () => {
    const out = parseGuestImport('Bapak Hendra, S.E.\t081234567890')
    expect(out).toEqual([{ name: 'Bapak Hendra, S.E.', phoneE164: '6281234567890', lineNo: 1 }])
  })

  it('parses multiple lines, mixing phone-present and phone-absent rows', () => {
    const input = [
      'Agus Salim\t081234567890',
      'Budi Santoso',
      'Keluarga Pak Hendra\t087654321098',
    ].join('\n')
    const out = parseGuestImport(input)
    expect(out).toHaveLength(3)
    expect(out[1]).toEqual({ name: 'Budi Santoso', phoneE164: null, lineNo: 2 })
    expect(out[2].phoneE164).toBe('6287654321098')
  })

  it('skips blank lines and CRLF line endings', () => {
    const input = 'Agus\r\n\r\nBudi\n'
    const out = parseGuestImport(input)
    expect(out).toEqual([
      { name: 'Agus', phoneE164: null, lineNo: 1 },
      { name: 'Budi', phoneE164: null, lineNo: 3 },
    ])
  })

  it('trims surrounding whitespace from name and phone column', () => {
    const out = parseGuestImport('   Agus Salim   \t  081234567890  ')
    expect(out[0]).toEqual({ name: 'Agus Salim', phoneE164: '6281234567890', lineNo: 1 })
  })

  it('rejects rows with empty name', () => {
    const out = parseGuestImport('\t081234567890\nAgus')
    expect(out).toEqual([{ name: 'Agus', phoneE164: null, lineNo: 2 }])
  })

  it('passes through malformed phone as null and keeps the name', () => {
    const out = parseGuestImport('Agus\tabc-not-a-phone')
    expect(out[0]).toEqual({ name: 'Agus', phoneE164: null, lineNo: 1 })
  })
})
