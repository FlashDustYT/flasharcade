-- ============================================================
-- FlashPortal V77 FULL BACKEND
-- Full drop-in backend update for V72 -> V77
-- Legacy Pioneer Badge + Persistent Likes/Dislikes + Comment Delete
-- Faster Creator Hub Feed + Achievement Catalog
-- ============================================================
-- Run this whole file once in Supabase SQL Editor.
-- If Supabase warns about RLS, click: Run and enable RLS.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.platform_settings enable row level security;
drop policy if exists "platform settings readable" on public.platform_settings;
create policy "platform settings readable" on public.platform_settings for select to anon, authenticated using (true);

insert into public.platform_settings(key, value)
values ('early_build', 'true'::jsonb)
on conflict (key) do nothing;

alter table public.user_profiles
  add column if not exists is_deleted boolean default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists last_seen_at timestamptz,
  add column if not exists is_private boolean default false;

alter table public.social_posts
  add column if not exists likes integer default 0,
  add column if not exists dislikes integer default 0,
  add column if not exists comments integer default 0,
  add column if not exists is_deleted boolean default false,
  add column if not exists is_private boolean default false,
  add column if not exists video_url text,
  add column if not exists media_type text;

alter table public.social_comments
  add column if not exists is_deleted boolean default false;

create table if not exists public.social_post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id bigint not null references public.social_posts(id) on delete cascade,
  user_id uuid not null,
  reaction text not null check (reaction in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(post_id, user_id)
);
alter table public.social_post_reactions enable row level security;

drop policy if exists "read social reactions" on public.social_post_reactions;
create policy "read social reactions" on public.social_post_reactions for select to anon, authenticated using (true);
drop policy if exists "insert own social reactions" on public.social_post_reactions;
create policy "insert own social reactions" on public.social_post_reactions for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "update own social reactions" on public.social_post_reactions;
create policy "update own social reactions" on public.social_post_reactions for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "delete own social reactions" on public.social_post_reactions;
create policy "delete own social reactions" on public.social_post_reactions for delete to authenticated using (user_id = auth.uid());

create table if not exists public.achievement_catalog (
  code text primary key,
  title text not null,
  rarity text not null check (rarity in ('legacy','mythic','legendary','epic','rare','uncommon','common')),
  category text not null default 'platform',
  game_id text,
  description text not null,
  unlock_hint text not null,
  points integer not null default 10,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  badge_code text not null references public.achievement_catalog(code) on delete cascade,
  earned_at timestamptz not null default now(),
  unique(user_id, badge_code)
);
alter table public.achievement_catalog enable row level security;
alter table public.user_badges enable row level security;

drop policy if exists "read achievement catalog" on public.achievement_catalog;
create policy "read achievement catalog" on public.achievement_catalog for select to anon, authenticated using (true);
drop policy if exists "read user badges" on public.user_badges;
create policy "read user badges" on public.user_badges for select to anon, authenticated using (true);
drop policy if exists "insert own user badges" on public.user_badges;
create policy "insert own user badges" on public.user_badges for insert to authenticated with check (user_id = auth.uid());

create index if not exists social_posts_feed_v77_idx on public.social_posts(created_at desc) where coalesce(is_deleted,false)=false and coalesce(is_private,false)=false;
create index if not exists social_comments_post_v77_idx on public.social_comments(post_id, created_at) where coalesce(is_deleted,false)=false;
create index if not exists social_post_reactions_user_post_v77_idx on public.social_post_reactions(user_id, post_id);
create index if not exists social_post_reactions_post_reaction_v77_idx on public.social_post_reactions(post_id, reaction);
create index if not exists user_badges_user_v77_idx on public.user_badges(user_id);
create index if not exists user_profiles_public_v77_idx on public.user_profiles(followers desc, username) where coalesce(is_deleted,false)=false and coalesce(is_private,false)=false;

alter table public.achievement_catalog
  add column if not exists category text not null default 'platform',
  add column if not exists game_id text,
  add column if not exists unlock_hint text not null default '',
  add column if not exists points integer not null default 10,
  add column if not exists is_hidden boolean not null default false;


-- Fix older achievement_catalog rarity constraint so Legacy badges are allowed.
do $$
declare
  constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.achievement_catalog'::regclass
    and contype = 'c'
    and conname like '%rarity%check%'
  limit 1;

  if constraint_name is not null then
    execute format('alter table public.achievement_catalog drop constraint %I', constraint_name);
  end if;
end $$;

alter table public.achievement_catalog
  add constraint achievement_catalog_rarity_check
  check (rarity in ('legacy','mythic','legendary','epic','rare','uncommon','common'));

insert into public.achievement_catalog(code,title,rarity,category,game_id,description,unlock_hint,points,is_hidden)
values
('flashportal_pioneer','FlashPortal Pioneer','legacy','legacy',null,'Joined FlashPortal during the Early Build era before the official launch.','Create an account before FlashPortal Official releases.',1000,false),
('profile_started','Profile Started','common','platform',null,'Saved your profile for the first time.','Edit and save your profile.',10,false),
('profile_pic','Fresh Face','common','platform',null,'Added a profile picture.','Upload a profile picture.',10,false),
('bio_added','Bio Online','common','platform',null,'Added a bio to your page.','Add a profile bio.',10,false),
('first_post','First Post','common','social',null,'Posted your first update.','Create a post.',10,false),
('first_rating','First Rating','common','games',null,'Rated your first game.','Rate any game.',10,false),
('first_review','First Review','uncommon','games',null,'Wrote your first written review.','Write a review.',20,false),
('first_save','First Save','common','games',null,'Saved your first game.','Save any game.',10,false),
('first_message','First Message','common','social',null,'Sent your first message.','Send a message to another user.',10,false),
('community_voice','Community Voice','uncommon','social',null,'Left your first comment.','Comment on a post.',20,false),
('heart_giver','Heart Giver','uncommon','social',null,'Liked your first post.','Like a community post.',20,false),
('conversation_starter','Conversation Starter','rare','social',null,'Started multiple conversations across FlashPortal.','Start 10 conversations.',80,false),
('community_regular','Community Regular','rare','social',null,'Posted consistently and helped the feed feel alive.','Make 25 public posts.',80,false),
('viral_spark','Viral Spark','epic','social',null,'One of your posts got serious attention.','Get 50 likes on one post.',180,false),
('crowd_favorite','Crowd Favorite','legendary','social',null,'Your posts became a major part of the community.','Reach 500 total post likes.',350,false),
('first_upload','First Upload','common','creator',null,'Published your first game.','Upload a game.',25,false),
('featured_creator','Featured Creator','rare','creator',null,'Had a game featured on the homepage.','Get one game featured.',100,false),
('trending_creator','Trending Creator','epic','creator',null,'Had a game trend on FlashPortal.','Reach Trending Now.',200,false),
('creator_favorite','Creator Favorite','legendary','creator',null,'Built a creator profile people keep coming back to.','Reach 100 followers.',400,false),
('portal_icon','Portal Icon','mythic','creator',null,'Became one of the defining creators on FlashPortal.','Reach 1,000 followers or a platform milestone.',900,false),
('rings_rookie','Rings Rookie','common','how-many-rings','how-many-rings','Started chasing banners in How Many Rings.','Play How Many Rings once.',10,false),
('banner_chaser','Banner Chaser','uncommon','how-many-rings','how-many-rings','Built a team good enough to matter.','Win your first title.',40,false),
('dynasty_builder','Dynasty Builder','rare','how-many-rings','how-many-rings','Built more than a one-season wonder.','Win 3 titles in one run.',100,false),
('ten_year_legend','10-Year Legend','epic','how-many-rings','how-many-rings','Mastered the full title window.','Win 5 titles in the 10-year window.',220,false),
('perfect_dynasty','Perfect Dynasty','mythic','how-many-rings','how-many-rings','Created the kind of dynasty people argue about forever.','Win every possible title in a perfect run.',900,true),
('rookie_coach','Rookie Coach','common','legacy-league','legacy-league','Started your coaching career.','Play Legacy League once.',10,false),
('league_champion','League Champion','rare','legacy-league','legacy-league','Won the league title.','Win a championship.',110,false),
('undefeated_general','Undefeated General','legendary','legacy-league','legacy-league','Dominated without taking a loss.','Complete an undefeated season.',450,false),
('word_starter','Word Starter','common','guess-the-word','guess-the-word','Solved your first word puzzle.','Win Guess The Word once.',10,false),
('no_hint_needed','No Hints Needed','uncommon','guess-the-word','guess-the-word','Solved without needing help.','Win without using a hint.',40,false),
('word_streak_5','Word Streak 5','rare','guess-the-word','guess-the-word','Put together a clean streak.','Win 5 rounds in a row.',100,false),
('speed_speller','Speed Speller','epic','guess-the-word','guess-the-word','Solved under pressure.','Solve a puzzle very quickly.',220,false),
('dictionary_master','Dictionary Master','legendary','guess-the-word','guess-the-word','Made word puzzles look easy.','Win 50 Guess The Word games.',500,false),
('celeb_spotter','Celeb Spotter','common','guess-the-celeb','guess-the-celeb','Guessed your first celebrity.','Win Guess The Celeb once.',10,false),
('pop_culture_ready','Pop Culture Ready','uncommon','guess-the-celeb','guess-the-celeb','You know more faces than you admit.','Win 10 rounds.',40,false),
('celebrity_expert','Celebrity Expert','epic','guess-the-celeb','guess-the-celeb','Consistently recognizes the stars.','Win 50 rounds.',240,false)
on conflict (code) do update set title=excluded.title, rarity=excluded.rarity, category=excluded.category, game_id=excluded.game_id, description=excluded.description, unlock_hint=excluded.unlock_hint, points=excluded.points, is_hidden=excluded.is_hidden;

insert into public.user_badges(user_id, badge_code)
select up.id, 'flashportal_pioneer'
from public.user_profiles up
where coalesce(up.is_deleted,false)=false and coalesce((select value::boolean from public.platform_settings where key='early_build'), true)=true
on conflict (user_id, badge_code) do nothing;

create or replace function public.fp_award_early_build_badge()
returns trigger language plpgsql security definer set search_path = public as $$
declare is_early boolean := true;
begin
  select coalesce(value::boolean, true) into is_early from public.platform_settings where key = 'early_build';
  if coalesce(is_early, true)=true then
    insert into public.user_badges(user_id,badge_code) values(new.id,'flashportal_pioneer') on conflict(user_id,badge_code) do nothing;
  end if;
  return new;
end; $$;
drop trigger if exists trg_award_early_build_badge on public.user_profiles;
create trigger trg_award_early_build_badge after insert on public.user_profiles for each row execute function public.fp_award_early_build_badge();

create or replace function public.fp_set_social_reaction(target_post_id bigint, new_reaction text)
returns table(likes integer, dislikes integer, my_reaction text)
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); clean_reaction text := nullif(trim(lower(new_reaction)), ''); like_count integer; dislike_count integer; final_reaction text;
begin
  if uid is null then raise exception 'login_required'; end if;
  if clean_reaction not in ('like','dislike') and clean_reaction is not null then raise exception 'invalid_reaction'; end if;
  if clean_reaction is null then
    delete from public.social_post_reactions where post_id=target_post_id and user_id=uid;
  elsif exists (select 1 from public.social_post_reactions where post_id=target_post_id and user_id=uid and reaction=clean_reaction) then
    delete from public.social_post_reactions where post_id=target_post_id and user_id=uid;
  else
    insert into public.social_post_reactions(post_id,user_id,reaction,updated_at) values(target_post_id,uid,clean_reaction,now())
    on conflict(post_id,user_id) do update set reaction=excluded.reaction, updated_at=now();
  end if;
  select count(*)::integer into like_count from public.social_post_reactions where post_id=target_post_id and reaction='like';
  select count(*)::integer into dislike_count from public.social_post_reactions where post_id=target_post_id and reaction='dislike';
  select reaction into final_reaction from public.social_post_reactions where post_id=target_post_id and user_id=uid;
  update public.social_posts set likes=like_count, dislikes=dislike_count where id=target_post_id;
  return query select like_count, dislike_count, final_reaction;
end; $$;
grant execute on function public.fp_set_social_reaction(bigint,text) to authenticated;

create or replace function public.fp_delete_social_comment(target_comment_id bigint)
returns boolean language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); target_post bigint;
begin
  if uid is null then raise exception 'login_required'; end if;
  select post_id into target_post from public.social_comments where id=target_comment_id;
  if target_post is null then return false; end if;
  update public.social_comments sc set is_deleted=true where sc.id=target_comment_id and (sc.user_id=uid or exists(select 1 from public.social_posts sp where sp.id=sc.post_id and sp.user_id=uid));
  update public.social_posts sp set comments=(select count(*)::integer from public.social_comments sc where sc.post_id=sp.id and coalesce(sc.is_deleted,false)=false) where sp.id=target_post;
  return true;
end; $$;
grant execute on function public.fp_delete_social_comment(bigint) to authenticated;

create or replace function public.fp_get_creator_feed(feed_limit integer default 25)
returns table(id bigint,user_id uuid,body text,image_url text,video_url text,media_type text,created_at timestamptz,likes integer,dislikes integer,comments integer,my_reaction text,author_username text,author_display_name text,author_avatar_url text,author_is_private boolean,author_last_seen_at timestamptz)
language sql security definer set search_path = public as $$
  select sp.id,sp.user_id,sp.body,sp.image_url,sp.video_url,sp.media_type,sp.created_at,coalesce(sp.likes,0)::integer,coalesce(sp.dislikes,0)::integer,coalesce(sp.comments,0)::integer,spr.reaction,up.username,up.display_name,up.avatar_url,coalesce(up.is_private,false),up.last_seen_at
  from public.social_posts sp
  left join public.user_profiles up on up.id=sp.user_id
  left join public.social_post_reactions spr on spr.post_id=sp.id and spr.user_id=auth.uid()
  where coalesce(sp.is_deleted,false)=false and coalesce(sp.is_private,false)=false
  order by sp.created_at desc
  limit feed_limit;
$$;
grant execute on function public.fp_get_creator_feed(integer) to anon, authenticated;

create or replace function public.fp_get_achievement_page(target_user_id uuid default null)
returns table(code text,title text,rarity text,category text,game_id text,description text,unlock_hint text,points integer,is_hidden boolean,earned boolean,earned_at timestamptz)
language sql security definer set search_path = public as $$
  select ac.code,ac.title,ac.rarity,ac.category,ac.game_id,ac.description,ac.unlock_hint,ac.points,ac.is_hidden,(ub.id is not null) as earned,ub.earned_at
  from public.achievement_catalog ac
  left join public.user_badges ub on ub.badge_code=ac.code and ub.user_id=coalesce(target_user_id,auth.uid())
  where ac.is_hidden=false or ub.id is not null
  order by case ac.rarity when 'legacy' then 0 when 'mythic' then 1 when 'legendary' then 2 when 'epic' then 3 when 'rare' then 4 when 'uncommon' then 5 else 6 end, ac.points desc, ac.title asc;
$$;
grant execute on function public.fp_get_achievement_page(uuid) to anon, authenticated;

update public.platform_announcements set active=false where lower(coalesce(body,'')) in ('test','testing') or lower(coalesce(title,'')) in ('test','testing');
notify pgrst, 'reload schema';
