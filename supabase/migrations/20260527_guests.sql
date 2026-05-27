-- ============================================================================
-- 2026-05-27 — Guests list per invitation, with PII encrypted at rest.
--
-- Apply in Supabase: SQL Editor → New query → paste this file → Run.
-- Idempotent (IF NOT EXISTS), so safe to run more than once.
--
-- Encrypted columns (base64 of AES-256-GCM iv ‖ ciphertext ‖ authTag):
--   name_enc   — guest's display name (always present)
--   phone_enc  — E.164 phone, nullable. When null, the WA button
--                falls back to WhatsApp's contact picker URL.
--   notes_enc  — couple-only freeform notes, nullable.
--
-- Plaintext columns (intentional — low-sensitivity, useful for filters):
--   group_label — "Keluarga", "Kantor" — bucket label only.
--   sent_at     — optimistic timestamp when the WA button was clicked.
--
-- The encryption key lives in process.env.GUESTS_ENCRYPTION_KEY on the
-- Next.js server, never in this database. A DB dump leaks ciphertext only.
-- ============================================================================

CREATE TABLE IF NOT EXISTS guests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id   uuid NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  name_enc        text NOT NULL,
  phone_enc       text,
  group_label     text,
  notes_enc       text,
  sent_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guests_invitation_id ON guests(invitation_id);
CREATE INDEX IF NOT EXISTS idx_guests_sent_at ON guests(invitation_id, sent_at);

-- updated_at touch trigger. The set_updated_at() function is defined in the
-- initial schema; if absent, this CREATE TRIGGER will error and you should
-- run the initial schema first.
DROP TRIGGER IF EXISTS guests_set_updated_at ON guests;
CREATE TRIGGER guests_set_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS — server-only access via service_role. The dashboard reads/writes
-- through server actions that validate the per-slug session cookie before
-- touching the table, so anon should never see this table.
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- (No anon policies — deliberate. service_role bypasses RLS so server
-- actions work; anon cannot select/insert/update/delete.)
