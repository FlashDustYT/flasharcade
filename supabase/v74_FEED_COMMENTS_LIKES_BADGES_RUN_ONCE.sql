-- FlashPortal V74: per-user notification dismissals, community likes/comments, badge discovery
-- Run once in Supabase SQL Editor. Safe to rerun.

-- Per-user notification dismissal. Dismissing an announcement hides it only for that account/device,
-- not for future new users.
create table if not exists public.notification_dismissals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  notification_key text not null,
  dismissed_at timestamptz not null default now(),
  unique(user_id, notification_key)
);

alter table public.notification_dismissals enable row level security;

drop policy if exists "Users can read own notification dismissals" on public.notification_dismissals;
create policy "Users can read own notification dismissals"
on public.notification_dismissals for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert own notification dismissals" on public.notification_dismissals;
create policy "Users can insert own notification dismissals"
on public.notification_dismissals for insert
to authenticated
with check (user_id = auth.uid());

-- Social post likes.
create table if not exists public.social_post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

alter table public.social_post_likes enable row level security;

drop policy if exists "Public can read social likes" on public.social_post_likes;
create policy "Public can read social likes"
on public.social_post_likes for select
to anon, authenticated
using (true);

drop policy if exists "Users can like posts" on public.social_post_likes;
create policy "Users can like posts"
on public.social_post_likes for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can unlike own likes" on public.social_post_likes;
create policy "Users can unlike own likes"
on public.social_post_likes for delete
to authenticated
using (user_id = auth.uid());

-- Social comments.
create table if not exists public.social_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null,
  user_id uuid not null,
  body text not null,
  is_deleted boolean default false,
  created_at timestamptz not null default now()
);

alter table public.social_comments enable row level security;

drop policy if exists "Public can read social comments" on public.social_comments;
create policy "Public can read social comments"
on public.social_comments for select
to anon, authenticated
using (coalesce(is_deleted, false) = false);

drop policy if exists "Users can add social comments" on public.social_comments;
create policy "Users can add social comments"
on public.social_comments for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can delete own social comments" on public.social_comments;
create policy "Users can delete own social comments"
on public.social_comments for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create index if not exists social_post_likes_post_idx on public.social_post_likes(post_id);
create index if not exists social_comments_post_idx on public.social_comments(post_id, created_at);
create index if not exists notification_dismissals_user_idx on public.notification_dismissals(user_id, notification_key);

-- Ensure needed columns exist.
alter table public.social_posts
  add column if not exists likes integer default 0,
  add column if not exists comments integer default 0,
  add column if not exists is_private boolean default false,
  add column if not exists is_deleted boolean default false;

-- Remove old test announcements from active notifications.
update public.platform_announcements
set active = false
where lower(coalesce(body,'')) in ('test','testing')
   or lower(coalesce(title,'')) in ('test','testing');

notify pgrst, 'reload schema';
