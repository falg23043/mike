-- Migration 002: Per-call token usage + cost tracking
--
-- Append-only event log. One row per LLM call. Cost is computed in the backend
-- (public list price x billing multiplier) and stored here for fast monthly
-- aggregation. All access is via the backend service role (RLS enabled, no
-- anon/authenticated grants) — same pattern as every other app-owned table.

create table if not exists public.token_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  model text not null,
  provider text not null default 'unknown',
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  input_cost numeric(12, 6) not null default 0,
  output_cost numeric(12, 6) not null default 0,
  total_cost numeric(12, 6) not null default 0,
  used_own_key boolean not null default false,
  feature text not null default 'unknown',
  created_at timestamptz not null default now()
);

-- Fast per-user, per-month aggregation (the hot query for the UI counter and
-- the monthly report).
create index if not exists token_usage_user_created_idx
  on public.token_usage (user_id, created_at);

create index if not exists token_usage_created_idx
  on public.token_usage (created_at);

alter table public.token_usage enable row level security;

-- Backend-owned: browser never reads/writes this table directly.
revoke all on public.token_usage from anon, authenticated;
