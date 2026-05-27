import { describe, it, expect, beforeAll } from 'vitest'
import { randomBytes } from 'node:crypto'
import { encryptField, decryptField } from '../crypto'

beforeAll(() => {
  process.env.GUESTS_ENCRYPTION_KEY = randomBytes(32).toString('base64')
})

describe('encryptField / decryptField', () => {
  it('round-trips ASCII plaintext', () => {
    const ct = encryptField('Agus Salim')
    expect(ct).not.toBe('Agus Salim')
    expect(decryptField(ct)).toBe('Agus Salim')
  })

  it('round-trips Indonesian names with diacritics + commas', () => {
    const name = 'Bapak Hendra, S.E. — café au lait 🎉'
    expect(decryptField(encryptField(name))).toBe(name)
  })

  it('round-trips E.164 phone numbers', () => {
    expect(decryptField(encryptField('6281234567890'))).toBe('6281234567890')
  })

  it('produces different ciphertexts for identical plaintexts (random IV)', () => {
    const a = encryptField('same')
    const b = encryptField('same')
    expect(a).not.toBe(b)
    expect(decryptField(a)).toBe('same')
    expect(decryptField(b)).toBe('same')
  })

  it('returns null for null input on both directions', () => {
    expect(encryptField(null)).toBeNull()
    expect(decryptField(null)).toBeNull()
  })

  it('throws on tampered ciphertext (authTag detects mutation)', () => {
    const ct = encryptField('Agus')!
    const buf = Buffer.from(ct, 'base64')
    buf[buf.length - 5] ^= 0xff
    const tampered = buf.toString('base64')
    expect(() => decryptField(tampered)).toThrow()
  })

  it('throws if env key is missing', () => {
    const saved = process.env.GUESTS_ENCRYPTION_KEY
    delete process.env.GUESTS_ENCRYPTION_KEY
    try {
      expect(() => encryptField('x')).toThrow(/GUESTS_ENCRYPTION_KEY/)
    } finally {
      process.env.GUESTS_ENCRYPTION_KEY = saved
    }
  })

  it('throws if env key is wrong length', () => {
    const saved = process.env.GUESTS_ENCRYPTION_KEY
    process.env.GUESTS_ENCRYPTION_KEY = Buffer.from('short').toString('base64')
    try {
      expect(() => encryptField('x')).toThrow(/32 bytes/)
    } finally {
      process.env.GUESTS_ENCRYPTION_KEY = saved
    }
  })
})
