/**
 * normalizePhone — convert any user-typed Indonesian phone number to E.164
 * (the shape `wa.me/<phone>` expects: `62XXXXXXXXX`, no plus, no spaces).
 *
 * Rules:
 *   1. Strip every non-digit character.
 *   2. If the digit string begins with `0`, replace that single `0` with `62`.
 *   3. Reject if it doesn't start with `62` after step 2 (foreign numbers).
 *   4. Reject if total length < 11 or > 15 (E.164 bounds for valid ID numbers).
 *
 * Returns `null` for any rejected input so the UI can fall back to the
 * WhatsApp contact-picker URL rather than producing a broken `wa.me/...` link.
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  const digits = String(raw).replace(/\D+/g, '')
  if (!digits) return null

  let e164: string
  if (digits.startsWith('0')) {
    e164 = '62' + digits.slice(1)
  } else if (digits.startsWith('62')) {
    e164 = digits
  } else {
    return null
  }

  if (e164.length < 11 || e164.length > 15) return null
  return e164
}

/**
 * formatPhoneDisplay — render an E.164 phone as the familiar 0812-3456-7890
 * format for the dashboard table. Source of truth in DB is still E.164.
 */
export function formatPhoneDisplay(e164: string | null | undefined): string {
  if (!e164) return ''
  const local = '0' + e164.slice(2)
  return local.replace(/^(\d{4})(\d{4})(\d+)$/, '$1-$2-$3')
}
