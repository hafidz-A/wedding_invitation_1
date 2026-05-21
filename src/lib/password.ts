/**
 * Per-couple admin password hashing.
 *
 * Flow:
 *   • When a new couple is onboarded, the operator generates a password
 *     (any string) → hash with `hashPassword()` → store the hash in
 *     `invitations.password_hash`.
 *   • When the couple logs in to /<slug>/dashboard, they submit the raw
 *     password → server action calls `verifyPassword()` against the stored
 *     hash → on success, sign a session cookie scoped to that slug.
 */
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
