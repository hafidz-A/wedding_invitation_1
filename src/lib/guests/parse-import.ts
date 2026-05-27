import { normalizePhone } from './phone'

export interface ParsedGuestRow {
  name: string
  phoneE164: string | null
  /** 1-based original line number — used by the UI to highlight bad rows. */
  lineNo: number
}

/**
 * parseGuestImport — convert a tab-separated paste into structured rows.
 *
 * Format per line: `<name>\t<phone>?`
 *   - blank lines skipped
 *   - name with no tab → treated as name-only (phone = null)
 *   - phone column normalized via normalizePhone; if rejected → phone = null
 *     but the row is still imported (name is the only required field)
 *   - rows with empty name (e.g. `\t08123...`) are dropped silently
 */
export function parseGuestImport(text: string): ParsedGuestRow[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const rows: ParsedGuestRow[] = []
  lines.forEach((line, idx) => {
    const lineNo = idx + 1
    if (!line.trim()) return
    const [rawName, rawPhone] = line.split('\t', 2)
    const name = (rawName ?? '').trim()
    if (!name) return
    const phoneE164 = rawPhone ? normalizePhone(rawPhone.trim()) : null
    rows.push({ name, phoneE164, lineNo })
  })
  return rows
}
