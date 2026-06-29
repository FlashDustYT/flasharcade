-- FlashPortal V71: community feed media + safe read policies
-- Run once after deploying V71. Safe to rerun.

alter table public.social_posts
  add column if not exists video_url text,
  add column if not exists media_type text default 'image',
  add column if not exists updated_at timestamptz default now(),
  add column if not exists is_private boolean default false,
  add column if not exists is_deleted boolean default false;

create index if not exists social_posts_feed_idx
on public.social_posts(is_deleted, is_private, created_at desc);

-- Public community feed can read public, non-deleted posts.
drop policy if exists "Public can read public social posts" on public.social_posts;
create policy "Public can read public social posts"
on public.social_posts for select
to anon, authenticated
using (coalesce(is_deleted, false) = false and coalesce(is_private, false) = false);

-- Owners can read their own posts, even private ones.
drop policy if exists "Users can read own social posts" on public.social_posts;
create policy "Users can read own social posts"
on public.social_posts for select
to authenticated
using (user_id = auth.uid());

-- Users can create/update/delete their own posts.
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

-- Message unread badge uses read_at from V68/V70.
alter table public.direct_messages
  add column if not exists read_at timestamptz;


-- Public storage bucket for profile/post media.
insert into storage.buckets (id, name, public)
values ('profile-media', 'profile-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Users can upload profile media" on storage.objects;
create policy "Users can upload profile media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'profile-media' and auth.uid()::text = split_part(name, '/', 1));

drop policy if exists "Users can update profile media" on storage.objects;
create policy "Users can update profile media"
on storage.objects for update
to authenticated
using (bucket_id = 'profile-media' and auth.uid()::text = split_part(name, '/', 1))
with check (bucket_id = 'profile-media' and auth.uid()::text = split_part(name, '/', 1));

drop policy if exists "Public can read profile media" on storage.objects;
create policy "Public can read profile media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'profile-media');

notify pgrst, 'reload schema';
