-- FlashPortal V64 social/profile hotfix.
-- Run once in Supabase SQL Editor after deploying V64.

alter table public.user_profiles
  add column if not exists last_seen_at timestamptz default now();

alter table public.social_posts
  add column if not exists is_private boolean default false,
  add column if not exists is_deleted boolean default false,
  add column if not exists updated_at timestamptz default now();

create index if not exists user_profiles_username_lower_idx on public.user_profiles (lower(username));
create index if not exists user_profiles_email_lower_idx on public.user_profiles (lower(email));
create index if not exists social_posts_visible_idx on public.social_posts (user_id, is_deleted, created_at desc);

drop policy if exists "Users can update own social posts" on public.social_posts;
create policy "Users can update own social posts"
on public.social_posts for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own social posts" on public.social_posts;
create policy "Users can delete own social posts"
on public.social_posts for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Public can read non-deleted public social posts" on public.social_posts;
create policy "Public can read non-deleted public social posts"
on public.social_posts for select
using (
  coalesce(is_deleted, false) = false
  and (
    coalesce(is_private, false) = false
    or auth.uid() = user_id
    or exists (
      select 1 from public.profile_follows f
      where f.follower_id = auth.uid()
      and f.following_id = social_posts.user_id
    )
  )
);

notify pgrst, 'reload schema';
