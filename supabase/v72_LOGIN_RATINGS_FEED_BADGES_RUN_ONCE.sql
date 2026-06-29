-- FlashPortal V72: login-required ratings, feed audience, and permanent profile badges
-- Run once in Supabase SQL Editor. Safe to rerun.

-- Make sure review rows can be tied to signed-in users.
alter table public.game_reviews
  add column if not exists user_id uuid,
  add column if not exists user_email text,
  add column if not exists display_name text,
  add column if not exists rating integer,
  add column if not exists review text,
  add column if not exists created_at timestamptz default now();

alter table public.game_reviews enable row level security;

drop policy if exists "Public can read game reviews" on public.game_reviews;
create policy "Public can read game reviews"
on public.game_reviews for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users can create own reviews" on public.game_reviews;
create policy "Authenticated users can create own reviews"
on public.game_reviews for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own reviews" on public.game_reviews;
create policy "Users can update own reviews"
on public.game_reviews for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Feed audience: public community posts are is_private=false. Profile-only posts are is_private=true.
alter table public.social_posts
  add column if not exists video_url text,
  add column if not exists media_type text default 'image',
  add column if not exists updated_at timestamptz default now(),
  add column if not exists is_private boolean default false,
  add column if not exists is_deleted boolean default false;

alter table public.social_posts enable row level security;

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

drop policy if exists "Users can create own social posts" on public.social_posts;
create policy "Users can create own social posts"
on public.social_posts for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update own social posts" on public.social_posts;
create policy "Users can update own social posts"
on public.social_posts for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Permanent badges / achievements.
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

-- Storage bucket for profile/post media.
insert into storage.buckets (id, name, public)
values ('profile-media', 'profile-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Users can upload profile media" on storage.objects;
create policy "Users can upload profile media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'profile-media' and auth.uid()::text = split_part(name, '/', 1));

drop policy if exists "Public can read profile media" on storage.objects;
create policy "Public can read profile media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'profile-media');

notify pgrst, 'reload schema';
