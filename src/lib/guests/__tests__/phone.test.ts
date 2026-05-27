import { describe, it, expect } from 'vitest'
import { normalizePhone, formatPhoneDisplay } from '../phone'

describe('normalizePhone', () => {
  it('strips non-digits and converts leading 0 to 62', () => {
    expect(normalizePhone('081234567890')).toBe('6281234567890')
  })
  it('handles dashes and spaces', () => {
    expect(normalizePhone('0812-3456-7890')).toBe('6281234567890')
    expect(normalizePhone('0812 3456 7890')).toBe('6281234567890')
  })
  it('handles +62 prefix', () => {
    expect(normalizePhone('+62 812 3456 7890')).toBe('6281234567890')
  })
  it('handles bare 62 prefix', () => {
    expect(normalizePhone('6281234567890')).toBe('6281234567890')
  })
  it('returns null for too-short numbers', () => {
    expect(normalizePhone('0812345')).toBeNull()
  })
  it('returns null for non-Indonesia country codes', () => {
    expect(normalizePhone('+1 555 123 4567')).toBeNull()
  })
  it('returns null for empty / whitespace', () => {
    expect(normalizePhone('')).toBeNull()
    expect(normalizePhone('   ')).toBeNull()
  })
})

describe('formatPhoneDisplay', () => {
  it('formats E.164 as 0812-3456-7890 for display', () => {
    expect(formatPhoneDisplay('6281234567890')).toBe('0812-3456-7890')
  })
  it('returns empty string for null input', () => {
    expect(formatPhoneDisplay(null)).toBe('')
  })
})
