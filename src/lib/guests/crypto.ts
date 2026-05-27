import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

/**
 * App-level AES-256-GCM encryption for guest PII (name, phone, notes).
 *
 * Why GCM:
 *   - Authenticated: the 16-byte authTag detects tampering. If anyone
 *     modifies a row in Postgres directly, decryptField throws instead
 *     of returning corrupted-but-plausible text.
 *   - Per-row IV: each call generates a fresh 12-byte IV, so identical
 *     plaintexts produce different ciphertexts (no frequency analysis
 *     attack across the DB).
 *
 * On-disk format: base64(IV ‖ ciphertext ‖ authTag).
 *   - IV is 12 bytes (GCM standard)
 *   - authTag is 16 bytes (GCM default)
 *   - ciphertext is variable length (utf8 byte length of plaintext)
 *
 * Key source: process.env.GUESTS_ENCRYPTION_KEY (32 raw bytes, base64-encoded
 * → 44 chars). Generated with `crypto.randomBytes(32).toString('base64')`
 * and stored in .env.local (never committed).
 */

const ALG = 'aes-256-gcm'
const IV_LEN = 12
const TAG_LEN = 16
const KEY_LEN = 32

function getKey(): Buffer {
  const b64 = process.env.GUESTS_ENCRYPTION_KEY
  if (!b64) {
    throw new Error(
      'GUESTS_ENCRYPTION_KEY env var is required. ' +
      'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"',
    )
  }
  const key = Buffer.from(b64, 'base64')
  if (key.length !== KEY_LEN) {
    throw new Error(`GUESTS_ENCRYPTION_KEY must decode to ${KEY_LEN} bytes (got ${key.length})`)
  }
  return key
}

/** Encrypt a string field. Returns null for null input. */
export function encryptField(plaintext: string | null | undefined): string | null {
  if (plaintext === null || plaintext === undefined) return null
  const key = getKey()
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv(ALG, key, iv)
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, ct, tag]).toString('base64')
}

/** Decrypt a base64 payload produced by encryptField. Throws on tampering. */
export function decryptField(payload: string | null | undefined): string | null {
  if (payload === null || payload === undefined) return null
  const key = getKey()
  const buf = Buffer.from(payload, 'base64')
  if (buf.length < IV_LEN + TAG_LEN) {
    throw new Error('Encrypted payload is too short to be valid')
  }
  const iv = buf.subarray(0, IV_LEN)
  const tag = buf.subarray(buf.length - TAG_LEN)
  const ct = buf.subarray(IV_LEN, buf.length - TAG_LEN)
  const decipher = createDecipheriv(ALG, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8')
}
