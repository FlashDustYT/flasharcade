-- FlashPortal V75: persistent community likes/comments + real progress/badge views
-- Run once after V74. Safe to rerun.

-- Make sure feed tables exist.
create table if not exists public.social_post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

create table if not exists public.social_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null,
  user_id uuid not null,
  body text not null,
  is_deleted boolean default false,
  created_at timestamptz not null default now()
);

alter table public.social_post_likes enable row level security;
alter table public.social_comments enable row level security;

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

drop policy if exists "Users can soft delete own social comments" on public.social_comments;
create policy "Users can soft delete own social comments"
on public.social_comments for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create index if not exists social_post_likes_post_idx on public.social_post_likes(post_id);
create index if not exists social_comments_post_idx on public.social_comments(post_id, created_at);

alter table public.social_posts
  add column if not exists likes integer default 0,
  add column if not exists comments integer default 0,
  add column if not exists is_private boolean default false,
  add column if not exists is_deleted boolean default false;

-- RPC avoids frontend/RLS edge cases, so likes/comments stay after refresh.
create or replace function public.fp_toggle_social_like(target_post_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  new_count integer;
begin
  if uid is null then
    raise exception 'login_required';
  end if;

  if exists (select 1 from public.social_post_likes where post_id = target_post_id and user_id = uid) then
    delete from public.social_post_likes where post_id = target_post_id and user_id = uid;
  else
    insert into public.social_post_likes(post_id, user_id)
    values (target_post_id, uid)
    on conflict (post_id, user_id) do nothing;
  end if;

  select count(*)::integer into new_count from public.social_post_likes where post_id = target_post_id;

  update public.social_posts
  set likes = new_count
  where id = target_post_id;

  return new_count;
end;
$$;

grant execute on function public.fp_toggle_social_like(uuid) to authenticated;

create or replace function public.fp_add_social_comment(target_post_id uuid, comment_body text)
returns table(id uuid, post_id uuid, user_id uuid, body text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  clean_body text := nullif(trim(comment_body), '');
  inserted_id uuid;
begin
  if uid is null then
    raise exception 'login_required';
  end if;

  if clean_body is null then
    raise exception 'empty_comment';
  end if;

  insert into public.social_comments(post_id, user_id, body)
  values (target_post_id, uid, clean_body)
  returning social_comments.id into inserted_id;

  update public.social_posts
  set comments = (select count(*)::integer from public.social_comments where social_comments.post_id = target_post_id and coalesce(is_deleted, false) = false)
  where social_posts.id = target_post_id;

  return query
  select c.id, c.post_id, c.user_id, c.body, c.created_at
  from public.social_comments c
  where c.id = inserted_id;
end;
$$;

grant execute on function public.fp_add_social_comment(uuid, text) to authenticated;

-- Badge/progress tables should already exist from V73, but keep safe.
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

-- starter badges for existing profiles so the progress page does not look empty forever.
insert into public.user_badges(user_id, badge_code)
select id, 'early_player'
from public.user_profiles
where coalesce(is_deleted, false) = false
on conflict (user_id, badge_code) do nothing;

insert into public.user_badges(user_id, badge_code)
select id, 'profile_started'
from public.user_profiles
where coalesce(is_deleted, false) = false
on conflict (user_id, badge_code) do nothing;

insert into public.user_badges(user_id, badge_code)
select id, 'profile_pic'
from public.user_profiles
where coalesce(is_deleted, false) = false
  and coalesce(avatar_url, '') <> ''
on conflict (user_id, badge_code) do nothing;

insert into public.user_badges(user_id, badge_code)
select id, 'bio_added'
from public.user_profiles
where coalesce(is_deleted, false) = false
  and coalesce(bio, '') <> ''
on conflict (user_id, badge_code) do nothing;

notify pgrst, 'reload schema';
