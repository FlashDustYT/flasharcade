-- FlashPortal V73: faster reads, account delete flags, creator/game achievements
-- Run once in Supabase SQL Editor. Safe to rerun.

alter table public.user_profiles
  add column if not exists is_deleted boolean default false,
  add column if not exists deleted_at timestamptz;

create index if not exists user_profiles_active_idx
on public.user_profiles(is_deleted, followers desc, updated_at desc);

-- Allow users to soft-delete their own profile/account record.
drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
on public.user_profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Permanent profile badges.
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  badge_code text not null,
  earned_at timestamptz not null default now(),
  unique(user_id, badge_code)
);

alter table public.user_badges enable row level security;

drop policy if exists "Public can read badges" on public.user_badges;
create policy "Public can read badges"
on public.user_badges for select
to anon, authenticated
using (true);

drop policy if exists "Users can earn own badges" on public.user_badges;
create policy "Users can earn own badges"
on public.user_badges for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own badges" on public.user_badges;
create policy "Users can update own badges"
on public.user_badges for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Creator-defined achievements for each game.
create table if not exists public.game_achievements (
  id uuid primary key default gen_random_uuid(),
  game_id text not null,
  creator_id uuid,
  title text not null,
  description text,
  rarity text not null default 'Common',
  requirement_type text not null default 'custom',
  requirement_value numeric default 1,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.game_achievements enable row level security;

drop policy if exists "Public can read active game achievements" on public.game_achievements;
create policy "Public can read active game achievements"
on public.game_achievements for select
to anon, authenticated
using (coalesce(is_active, true) = true);

drop policy if exists "Creators can add own game achievements" on public.game_achievements;
create policy "Creators can add own game achievements"
on public.game_achievements for insert
to authenticated
with check (creator_id = auth.uid());

drop policy if exists "Creators can update own game achievements" on public.game_achievements;
create policy "Creators can update own game achievements"
on public.game_achievements for update
to authenticated
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

create index if not exists game_achievements_game_idx
on public.game_achievements(game_id, is_active, rarity);

-- Achievements users earned inside games.
create table if not exists public.user_game_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  game_id text not null,
  achievement_id uuid,
  achievement_code text,
  earned_at timestamptz not null default now(),
  unique(user_id, game_id, achievement_code)
);

alter table public.user_game_achievements enable row level security;

drop policy if exists "Users can read own game achievements" on public.user_game_achievements;
create policy "Users can read own game achievements"
on public.user_game_achievements for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can earn own game achievements" on public.user_game_achievements;
create policy "Users can earn own game achievements"
on public.user_game_achievements for insert
to authenticated
with check (user_id = auth.uid());

-- Community feed policies: public posts are visible, profile-only remains on profile only.
alter table public.social_posts
  add column if not exists video_url text,
  add column if not exists media_type text default 'image',
  add column if not exists updated_at timestamptz default now(),
  add column if not exists is_private boolean default false,
  add column if not exists is_deleted boolean default false;

create index if not exists social_posts_public_feed_idx
on public.social_posts(is_deleted, is_private, created_at desc);

drop policy if exists "Public can read public social posts" on public.social_posts;
create policy "Public can read public social posts"
on public.social_posts for select
to anon, authenticated
using (coalesce(is_deleted, false) = false and coalesce(is_private, false) = false);

drop policy if exists "Users can read own social posts" on public.social_posts;
create policy "Users can read own social posts"
on public.social_posts for select
to authenticated
using (user_id = auth.uid());

-- Storage bucket remains available.
insert into storage.buckets (id, name, public)
values ('profile-media', 'profile-media', true)
on conflict (id) do update set public = true;

notify pgrst, 'reload schema';
