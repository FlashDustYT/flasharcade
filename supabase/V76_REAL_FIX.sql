-- FlashPortal V76 Real Fix SQL
-- Run this ONCE in Supabase SQL Editor.
-- Fixes persistent likes/comments, comment deletion, dislikes, badge catalog, and faster loading indexes.

create extension if not exists pgcrypto;

alter table public.user_profiles
  add column if not exists is_deleted boolean default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists last_seen_at timestamptz,
  add column if not exists followers integer default 0,
  add column if not exists following integer default 0,
  add column if not exists is_private boolean default false;

alter table public.social_posts
  add column if not exists likes integer default 0,
  add column if not exists dislikes integer default 0,
  add column if not exists comments integer default 0,
  add column if not exists is_private boolean default false,
  add column if not exists is_deleted boolean default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists video_url text,
  add column if not exists media_type text;

alter table public.social_comments
  add column if not exists is_deleted boolean default false,
  add column if not exists deleted_at timestamptz;

create table if not exists public.social_post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id bigint not null references public.social_posts(id) on delete cascade,
  user_id uuid not null,
  reaction text not null check (reaction in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(post_id, user_id)
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  badge_code text not null,
  earned_at timestamptz not null default now(),
  unique(user_id, badge_code)
);

create table if not exists public.achievement_catalog (
  code text primary key,
  title text not null,
  rarity text not null check (rarity in ('common','uncommon','rare','epic','legendary','mythic')),
  category text not null default 'platform',
  description text not null,
  unlock_hint text not null,
  points integer not null default 10,
  created_at timestamptz not null default now()
);

alter table public.social_post_reactions enable row level security;
alter table public.social_comments enable row level security;
alter table public.user_badges enable row level security;
alter table public.achievement_catalog enable row level security;

drop policy if exists "read social reactions" on public.social_post_reactions;
create policy "read social reactions" on public.social_post_reactions for select to anon, authenticated using (true);

drop policy if exists "insert own social reactions" on public.social_post_reactions;
create policy "insert own social reactions" on public.social_post_reactions for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "update own social reactions" on public.social_post_reactions;
create policy "update own social reactions" on public.social_post_reactions for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "delete own social reactions" on public.social_post_reactions;
create policy "delete own social reactions" on public.social_post_reactions for delete to authenticated using (user_id = auth.uid());

drop policy if exists "read live comments" on public.social_comments;
create policy "read live comments" on public.social_comments for select to anon, authenticated using (coalesce(is_deleted, false) = false);

drop policy if exists "insert own comments" on public.social_comments;
create policy "insert own comments" on public.social_comments for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "update allowed comments" on public.social_comments;
create policy "update allowed comments" on public.social_comments for update to authenticated using (true) with check (true);

drop policy if exists "read badges" on public.user_badges;
create policy "read badges" on public.user_badges for select to anon, authenticated using (true);

drop policy if exists "insert own badges" on public.user_badges;
create policy "insert own badges" on public.user_badges for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "read achievement catalog" on public.achievement_catalog;
create policy "read achievement catalog" on public.achievement_catalog for select to anon, authenticated using (true);

create index if not exists social_posts_feed_fast_idx on public.social_posts(created_at desc) where coalesce(is_deleted, false) = false and coalesce(is_private, false) = false;
create index if not exists social_posts_user_fast_idx on public.social_posts(user_id, created_at desc) where coalesce(is_deleted, false) = false;
create index if not exists social_comments_post_fast_idx on public.social_comments(post_id, created_at) where coalesce(is_deleted, false) = false;
create index if not exists social_post_reactions_post_fast_idx on public.social_post_reactions(post_id);
create index if not exists social_post_reactions_user_fast_idx on public.social_post_reactions(user_id);
create index if not exists user_badges_user_fast_idx on public.user_badges(user_id);
create index if not exists achievement_catalog_category_fast_idx on public.achievement_catalog(category, rarity);
create index if not exists user_profiles_username_fast_idx on public.user_profiles(username) where coalesce(is_deleted, false) = false;

create or replace function public.fp_set_social_reaction(target_post_id bigint, new_reaction text)
returns table(likes integer, dislikes integer, my_reaction text)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  clean_reaction text := nullif(trim(lower(new_reaction)), '');
  like_count integer;
  dislike_count integer;
  final_reaction text;
begin
  if uid is null then
    raise exception 'login_required';
  end if;

  if clean_reaction not in ('like', 'dislike') and clean_reaction is not null then
    raise exception 'invalid_reaction';
  end if;

  if clean_reaction is null then
    delete from public.social_post_reactions
    where post_id = target_post_id and user_id = uid;
  else
    if exists (
      select 1 from public.social_post_reactions
      where post_id = target_post_id
        and user_id = uid
        and reaction = clean_reaction
    ) then
      delete from public.social_post_reactions
      where post_id = target_post_id and user_id = uid;
    else
      insert into public.social_post_reactions(post_id, user_id, reaction, updated_at)
      values (target_post_id, uid, clean_reaction, now())
      on conflict (post_id, user_id)
      do update set reaction = excluded.reaction, updated_at = now();
    end if;
  end if;

  select count(*)::integer into like_count
  from public.social_post_reactions
  where post_id = target_post_id and reaction = 'like';

  select count(*)::integer into dislike_count
  from public.social_post_reactions
  where post_id = target_post_id and reaction = 'dislike';

  select reaction into final_reaction
  from public.social_post_reactions
  where post_id = target_post_id and user_id = uid;

  update public.social_posts
  set likes = like_count,
      dislikes = dislike_count
  where id = target_post_id;

  return query select like_count, dislike_count, final_reaction;
end;
$$;

grant execute on function public.fp_set_social_reaction(bigint, text) to authenticated;

create or replace function public.fp_add_social_comment(target_post_id bigint, comment_body text)
returns table(id bigint, post_id bigint, user_id uuid, body text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  clean_body text := nullif(trim(comment_body), '');
  inserted_id bigint;
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
  set comments = (
    select count(*)::integer
    from public.social_comments
    where post_id = target_post_id
      and coalesce(is_deleted, false) = false
  )
  where id = target_post_id;

  return query
  select c.id, c.post_id, c.user_id, c.body, c.created_at
  from public.social_comments c
  where c.id = inserted_id;
end;
$$;

grant execute on function public.fp_add_social_comment(bigint, text) to authenticated;

create or replace function public.fp_delete_social_comment(target_comment_id bigint)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  target_post bigint;
  new_count integer;
begin
  if uid is null then
    raise exception 'login_required';
  end if;

  select c.post_id
  into target_post
  from public.social_comments c
  join public.social_posts p on p.id = c.post_id
  where c.id = target_comment_id
    and coalesce(c.is_deleted, false) = false
    and (c.user_id = uid or p.user_id = uid);

  if target_post is null then
    raise exception 'not_allowed_or_missing';
  end if;

  update public.social_comments
  set is_deleted = true,
      deleted_at = now()
  where id = target_comment_id;

  select count(*)::integer into new_count
  from public.social_comments
  where post_id = target_post
    and coalesce(is_deleted, false) = false;

  update public.social_posts
  set comments = new_count
  where id = target_post;

  return new_count;
end;
$$;

grant execute on function public.fp_delete_social_comment(bigint) to authenticated;

insert into public.achievement_catalog(code, title, rarity, category, description, unlock_hint, points) values
('profile_started','Profile Started','common','profile','You created your FlashPortal profile.','Save your profile once.',10),
('profile_pic','New Face','common','profile','You added a profile picture.','Upload or add a profile picture.',10),
('bio_added','Say Something','common','profile','You wrote a profile bio.','Add a bio to your profile.',10),
('first_post','First Status','common','social','You posted your first update.','Post on your profile or Creator Hub.',10),
('first_comment','Comment Starter','common','social','You left your first comment.','Comment on any Creator Hub post.',10),
('first_like','Heart Tapper','common','social','You liked your first post.','Like a Creator Hub post.',10),
('first_upload','First Upload','uncommon','creator','You uploaded your first game.','Publish a game.',30),
('three_uploads','Triple Drop','rare','creator','You uploaded three games.','Publish three games.',75),
('ten_uploads','Portal Builder','epic','creator','You uploaded ten games.','Publish ten games.',200),
('first_follower','First Fan','uncommon','creator','Someone followed you.','Get your first follower.',25),
('ten_followers','Small Crowd','rare','creator','You reached 10 followers.','Reach 10 followers.',75),
('hundred_followers','Real Audience','epic','creator','You reached 100 followers.','Reach 100 followers.',250),
('word_clean_solve','Clean Solve','rare','guess_the_word','Beat Guess The Word without a wrong guess.','Win with no wrong guesses.',100),
('word_speedrun','Word Speedrun','epic','guess_the_word','Beat Guess The Word fast.','Solve under the target time.',200),
('word_master','Dictionary Demon','legendary','guess_the_word','Mastered Guess The Word over many rounds.','Win many clean rounds.',600),
('celeb_no_hints','No Hint Needed','rare','guess_the_celeb','Beat Guess The Celeb without hints.','Win without hints.',125),
('celeb_streak','Paparazzi Proof','epic','guess_the_celeb','Built a strong correct-answer streak.','Guess multiple celebs correctly in a row.',250),
('rings_first_title','First Banner','uncommon','how_many_rings','Won your first championship.','Win a title in How Many Rings.',50),
('rings_three_titles','Mini Dynasty','rare','how_many_rings','Won three championships.','Win three titles in one run.',150),
('rings_perfect_window','Perfect Decade','legendary','how_many_rings','Dominated the full 10-year title window.','Win the hardest title-window challenge.',1000),
('legacy_first_win','First Career Win','uncommon','legacy_league','Won your first Legacy League game.','Get your first Legacy League win.',50),
('legacy_playoffs','Playoff Push','rare','legacy_league','Reached the Legacy League playoffs.','Make the playoffs.',150),
('legacy_champion','Legacy Champion','epic','legacy_league','Won a Legacy League championship.','Win the championship.',350)
on conflict (code) do update set
  title = excluded.title,
  rarity = excluded.rarity,
  category = excluded.category,
  description = excluded.description,
  unlock_hint = excluded.unlock_hint,
  points = excluded.points;

insert into public.user_badges(user_id, badge_code)
select id, 'profile_started'
from public.user_profiles
where coalesce(is_deleted, false) = false
on conflict (user_id, badge_code) do nothing;

insert into public.user_badges(user_id, badge_code)
select id, 'profile_pic'
from public.user_profiles
where coalesce(is_deleted, false) = false and coalesce(avatar_url, '') <> ''
on conflict (user_id, badge_code) do nothing;

insert into public.user_badges(user_id, badge_code)
select id, 'bio_added'
from public.user_profiles
where coalesce(is_deleted, false) = false and coalesce(bio, '') <> ''
on conflict (user_id, badge_code) do nothing;

update public.platform_announcements
set active = false
where lower(coalesce(body, '')) in ('test', 'testing')
   or lower(coalesce(title, '')) in ('test', 'testing');

notify pgrst, 'reload schema';
