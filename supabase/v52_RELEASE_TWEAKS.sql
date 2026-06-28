-- FlashPortal V52 release tweaks
-- Run this once after V51 if private/delete persistence or free-upload checks need backend support.

create extension if not exists pgcrypto;

grant usage on schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Persist owner hide/private/delete actions so games do not come back after refresh.
create table if not exists public.game_visibility (
  game_id text primary key,
  hidden boolean not null default false,
  deleted boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_by_email text,
  updated_at timestamptz not null default now()
);

alter table public.game_visibility add column if not exists hidden boolean not null default false;
alter table public.game_visibility add column if not exists deleted boolean not null default false;
alter table public.game_visibility add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.game_visibility add column if not exists updated_by_email text;
alter table public.game_visibility add column if not exists updated_at timestamptz not null default now();

alter table public.game_visibility enable row level security;
grant select on public.game_visibility to anon, authenticated;
grant insert, update, delete on public.game_visibility to authenticated;

drop policy if exists "Public can read game visibility" on public.game_visibility;
drop policy if exists "Owner can manage game visibility" on public.game_visibility;

create policy "Public can read game visibility"
on public.game_visibility for select
using (true);

create policy "Owner can manage game visibility"
on public.game_visibility for all to authenticated
using (lower(auth.jwt() ->> 'email') = 'isaac.akinola122@gmail.com')
with check (lower(auth.jwt() ->> 'email') = 'isaac.akinola122@gmail.com');

-- Make sure creators can read their own submissions so free-upload lock works.
alter table public.game_submissions enable row level security;
grant select, insert, update on public.game_submissions to authenticated;

drop policy if exists "Creators can read their own submissions" on public.game_submissions;
create policy "Creators can read their own submissions"
on public.game_submissions for select to authenticated
using (auth.uid() = creator_id or lower(creator_email) = lower(auth.jwt() ->> 'email'));

-- Keep owner queue update rights active.
drop policy if exists "Owner can update all submissions" on public.game_submissions;
create policy "Owner can update all submissions"
on public.game_submissions for update to authenticated
using (lower(auth.jwt() ->> 'email') = 'isaac.akinola122@gmail.com')
with check (lower(auth.jwt() ->> 'email') = 'isaac.akinola122@gmail.com');

notify pgrst, 'reload schema';
