-- ============================================================================
--  AUTH MIGRATION — bcrypt + per-slug cookie → Supabase Auth
--
--  Run this AFTER schema.sql has been applied. Idempotent.
--
--  What it does:
--    1. Adds `owner_user_id uuid` to `invitations`, FK to auth.users
--    2. Adds an index on it for fast ownership lookups
--    3. Adds a RLS policy so authenticated owners can SELECT their own
--       invitation row directly via the anon key (no service_role needed
--       for the dashboard's initial fetch)
--
--  The `password_hash` column is left in place during the transition —
--  drop it later once all invitations have been migrated to Supabase Auth.
-- ============================================================================

-- 1. owner_user_id column (nullable during migration, NOT NULL once cutover)
alter table public.invitations
  add column if not exists owner_user_id uuid
    references auth.users(id) on delete set null;

create index if not exists idx_invitations_owner_user
  on public.invitations (owner_user_id);

-- 2. RLS policy: authenticated owners can SELECT their own invitation
drop policy if exists "owners can read their invitation" on public.invitations;
create policy "owners can read their invitation"
  on public.invitations for select
  to authenticated
  using (owner_user_id = auth.uid());

-- Note: the existing "public read published invitations" policy stays —
-- guests still need to view published invitations anonymously.

-- 3. RLS policy: authenticated owners can READ their own RSVPs / gifts /
--    notes / songs. Submission policies (anon insert) are unchanged.
drop policy if exists "owners read own rsvps" on public.rsvps;
create policy "owners read own rsvps"
  on public.rsvps for select
  to authenticated
  using (
    invitation_id in (
      select id from public.invitations where owner_user_id = auth.uid()
    )
  );

drop policy if exists "owners read own gifts" on public.gift_confirmations;
create policy "owners read own gifts"
  on public.gift_confirmations for select
  to authenticated
  using (
    invitation_id in (
      select id from public.invitations where owner_user_id = auth.uid()
    )
  );

drop policy if exists "owners read own notes" on public.guestbook_notes;
create policy "owners read own notes"
  on public.guestbook_notes for select
  to authenticated
  using (
    invitation_id in (
      select id from public.invitations where owner_user_id = auth.uid()
    )
  );

-- ============================================================================
--  Verify
-- ============================================================================
-- After running, this should return TRUE:
--   select column_name from information_schema.columns
--   where table_name = 'invitations' and column_name = 'owner_user_id';
