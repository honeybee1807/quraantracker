-- =============================================================
-- My Quraan Tracker — Supabase hardening
-- Run this once in the Supabase SQL Editor (Dashboard > SQL Editor).
--
-- Problem being fixed: all four tables currently have no Row Level
-- Security, so the public anon key (already visible in config.js,
-- as intended for Supabase) can list every row with no id/filter,
-- and can INSERT/UPDATE/DELETE any row. Verified live:
--   GET /rest/v1/khatms?select=id&limit=5   -> returned every khatm
--   DELETE /rest/v1/personal_khatms?id=eq.X -> succeeded with no auth
--
-- Fix:
--   1. Enable RLS on all four tables.
--   2. Keep INSERT open (needed for "create a new Khatam/counter").
--   3. Keep UPDATE open (needed for claiming paras / logging counts
--      via a share link — the id itself is the "access token" in
--      this app's design, there's no real user auth).
--   4. Remove DELETE entirely — nothing in the app ever deletes a
--      row, so there's no legitimate reason anon should be able to.
--   5. Remove direct table SELECT — this is what enabled bulk
--      enumeration. Reads now only happen through get_*(id) RPC
--      functions below, which always require one exact id and can
--      never return "everything".
--
-- CAVEAT (read before running): RLS policies apply per-row, not per
-- -request — a `USING (true)` UPDATE policy still permits a PATCH
-- sent with NO id filter, which would update every row in the table
-- in one call. This script accepts that residual risk to keep the
-- app working without a front-end rewrite, matching what you asked
-- for (RLS + read-only lookup RPCs). If you want that closed too,
-- the fix is to replace direct UPDATE with write RPCs the same way
-- SELECT was replaced below — ask and it can be added the same way.
-- =============================================================


-- ── khatms ──────────────────────────────────────────────────
alter table public.khatms enable row level security;

drop policy if exists "khatms anon insert" on public.khatms;
create policy "khatms anon insert" on public.khatms
  for insert to anon
  with check (true);

drop policy if exists "khatms anon update" on public.khatms;
create policy "khatms anon update" on public.khatms
  for update to anon
  using (true)
  with check (true);

revoke select, delete on public.khatms from anon;

create or replace function public.get_khatm(p_id text)
returns setof public.khatms
language sql
security definer
set search_path = public
as $$
  select * from public.khatms where id = p_id;
$$;

grant execute on function public.get_khatm(text) to anon;


-- ── zikr_counters ───────────────────────────────────────────
alter table public.zikr_counters enable row level security;

drop policy if exists "zikr_counters anon insert" on public.zikr_counters;
create policy "zikr_counters anon insert" on public.zikr_counters
  for insert to anon
  with check (true);

drop policy if exists "zikr_counters anon update" on public.zikr_counters;
create policy "zikr_counters anon update" on public.zikr_counters
  for update to anon
  using (true)
  with check (true);

revoke select, delete on public.zikr_counters from anon;

create or replace function public.get_zikr_counter(p_id text)
returns setof public.zikr_counters
language sql
security definer
set search_path = public
as $$
  select * from public.zikr_counters where id = p_id;
$$;

grant execute on function public.get_zikr_counter(text) to anon;


-- ── yaaseen_counters ────────────────────────────────────────
alter table public.yaaseen_counters enable row level security;

drop policy if exists "yaaseen_counters anon insert" on public.yaaseen_counters;
create policy "yaaseen_counters anon insert" on public.yaaseen_counters
  for insert to anon
  with check (true);

drop policy if exists "yaaseen_counters anon update" on public.yaaseen_counters;
create policy "yaaseen_counters anon update" on public.yaaseen_counters
  for update to anon
  using (true)
  with check (true);

revoke select, delete on public.yaaseen_counters from anon;

create or replace function public.get_yaaseen_counter(p_id text)
returns setof public.yaaseen_counters
language sql
security definer
set search_path = public
as $$
  select * from public.yaaseen_counters where id = p_id;
$$;

grant execute on function public.get_yaaseen_counter(text) to anon;


-- ── personal_khatms ─────────────────────────────────────────
alter table public.personal_khatms enable row level security;

drop policy if exists "personal_khatms anon insert" on public.personal_khatms;
create policy "personal_khatms anon insert" on public.personal_khatms
  for insert to anon
  with check (true);

drop policy if exists "personal_khatms anon update" on public.personal_khatms;
create policy "personal_khatms anon update" on public.personal_khatms
  for update to anon
  using (true)
  with check (true);

revoke select, delete on public.personal_khatms from anon;

create or replace function public.get_personal_khatm(p_id text)
returns setof public.personal_khatms
language sql
security definer
set search_path = public
as $$
  select * from public.personal_khatms where id = p_id;
$$;

grant execute on function public.get_personal_khatm(text) to anon;


-- =============================================================
-- Round 2 — close the open UPDATE policy.
--
-- Problem: the "anon update" policies above use `USING (true)`,
-- which is per-row, not per-request. A PATCH sent with no ?id=
-- filter at all would still satisfy that policy for every row and
-- update the whole table in one call. The app UI never does this
-- (every PATCH is always filtered by ?id=eq.X) but the database
-- doesn't enforce that — it was only ever true by convention.
--
-- Fix: same pattern as the read RPCs. Drop the open UPDATE
-- policies, revoke the UPDATE privilege from anon, and replace
-- direct PATCH with SECURITY DEFINER functions that take an id
-- and the new data, and always filter to exactly that one row
-- internally. A bulk update becomes structurally impossible: there
-- is no way to call these functions "for every row".
-- =============================================================

-- ── khatms ──────────────────────────────────────────────────
drop policy if exists "khatms anon update" on public.khatms;
revoke update on public.khatms from anon;

create or replace function public.update_khatm(p_id text, p_paras jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  update public.khatms
  set paras = p_paras
  where id = p_id;
$$;

grant execute on function public.update_khatm(text, jsonb) to anon;


-- ── zikr_counters ───────────────────────────────────────────
drop policy if exists "zikr_counters anon update" on public.zikr_counters;
revoke update on public.zikr_counters from anon;

create or replace function public.update_zikr_counter(p_id text, p_total bigint, p_contributions jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  update public.zikr_counters
  set total = p_total, contributions = p_contributions
  where id = p_id;
$$;

grant execute on function public.update_zikr_counter(text, bigint, jsonb) to anon;


-- ── yaaseen_counters ────────────────────────────────────────
drop policy if exists "yaaseen_counters anon update" on public.yaaseen_counters;
revoke update on public.yaaseen_counters from anon;

create or replace function public.update_yaaseen_counter(p_id text, p_total bigint, p_contributions jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  update public.yaaseen_counters
  set total = p_total, contributions = p_contributions
  where id = p_id;
$$;

grant execute on function public.update_yaaseen_counter(text, bigint, jsonb) to anon;


-- ── personal_khatms ─────────────────────────────────────────
drop policy if exists "personal_khatms anon update" on public.personal_khatms;
revoke update on public.personal_khatms from anon;

create or replace function public.update_personal_khatm(p_id text, p_paras jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  update public.personal_khatms
  set paras = p_paras, updated_at = now()
  where id = p_id;
$$;

grant execute on function public.update_personal_khatm(text, jsonb) to anon;


-- =============================================================
-- After running this, direct "PATCH .../khatms?id=eq.X" style
-- writes will start returning permission denied (UPDATE is now
-- blocked). The front-end has been updated to call the RPCs
-- instead, e.g.:
--   POST /rest/v1/rpc/update_khatm
--   body: {"p_id": "ABCDE", "p_paras": [...]}
--
-- INSERT was intentionally left untouched — creating a new
-- Khatam/counter still goes direct to the table, as before.
-- =============================================================
