-- ============================================================================
-- Password reset support
--
-- Apply this in Supabase: SQL Editor → New query → paste this file → Run.
-- It's idempotent (uses IF NOT EXISTS), so safe to run more than once.
-- ============================================================================

-- 1. Store the couple's recovery email on the invitation row.
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS email text;
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(lower(email));

-- 2. One-shot tokens used to verify a "forgot password" request.
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token         text PRIMARY KEY,
  invitation_id uuid NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  expires_at    timestamptz NOT NULL,
  used_at       timestamptz,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_invitation
  ON password_reset_tokens(invitation_id);

CREATE INDEX IF NOT EXISTS idx_password_resets_expires
  ON password_reset_tokens(expires_at);

-- 3. Optional: scheduled cleanup of stale tokens (run as a cron from
--    Supabase Dashboard → Database → Cron, OR call this DELETE manually).
-- DELETE FROM password_reset_tokens WHERE expires_at < now() - interval '7 days';
