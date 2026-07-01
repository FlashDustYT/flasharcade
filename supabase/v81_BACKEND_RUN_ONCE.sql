-- FlashPortal V81 backend patch
-- Fixes comments display relationship issue, guarantees badge RPC/catalog, and supports game badge syncing.

create extension if not exists pgcrypto;
grant usage on schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Make sure comment table has the fields the frontend needs.
alter table public.social_comments
  add column if not exists is_deleted boolean default false;

-- Optional direct relationship for PostgREST. NOT VALID avoids breaking if there are old orphan comments.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname='social_comments_user_profiles_fkey'
  ) then
    alter table public.social_comments
      add constraint social_comments_user_profiles_fkey
      foreign key (user_id) references public.user_profiles(id) on delete cascade not valid;
  end if;
exception when others then
  -- The V81 frontend no longer depends on this FK, so do not fail the whole patch.
  null;
end $$;

create table if not exists public.achievement_catalog (
  code text primary key,
  title text not null,
  rarity text not null default 'common',
  category text not null default 'platform',
  game_id text,
  description text not null default '',
  unlock_hint text not null default '',
  points integer not null default 10,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.achievement_catalog
  add column if not exists category text not null default 'platform',
  add column if not exists game_id text,
  add column if not exists description text not null default '',
  add column if not exists unlock_hint text not null default '',
  add column if not exists points integer not null default 10,
  add column if not exists is_hidden boolean not null default false,
  add column if not exists created_at timestamptz not null default now();

do $$
declare c text;
begin
  for c in select conname from pg_constraint where conrelid='public.achievement_catalog'::regclass and contype='c' and conname like '%rarity%' loop
    execute format('alter table public.achievement_catalog drop constraint %I', c);
  end loop;
end $$;

alter table public.achievement_catalog
  add constraint achievement_catalog_rarity_check
  check (rarity in ('legacy','mythic','legendary','epic','rare','uncommon','common'));

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
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

insert into public.achievement_catalog(code,title,rarity,category,game_id,description,unlock_hint,points,is_hidden)
values
('flashportal_pioneer','FlashPortal Pioneer','legacy','legacy',null,'Joined FlashPortal during the Early Build before the official completed release.','Create an account before the official completed release.',1000,false),
('early_player','Early Player','legacy','legacy',null,'Joined FlashPortal during the early build.','Create an account during beta.',900,false),
('profile_started','Profile Started','common','profile',null,'Saved your FlashPortal profile.','Save your profile.',10,false),
('profile_pic','Profile Picture','common','profile',null,'Added a profile picture.','Add a profile picture.',10,false),
('bio_added','Bio Added','common','profile',null,'Added a profile bio.','Add a profile bio.',10,false),
('first_post','First Post','common','social',null,'Posted your first profile update.','Post an update.',20,false),
('first_comment','First Comment','common','social',null,'Commented on a community post.','Comment on a post.',20,false),
('first_like','First Reaction','common','social',null,'Reacted to a community post.','Like or dislike a post.',20,false),
('first_message','First Message','uncommon','social',null,'Sent your first direct message.','Send a message.',40,false),
('first_rating','First Rating','common','games',null,'Rated your first game.','Rate any game.',20,false),
('first_review','First Review','uncommon','games',null,'Wrote your first public review.','Write a review.',40,false),
('first_save','First Save','common','games',null,'Saved your first game.','Save any game.',20,false),
('creator_start','Creator Start','uncommon','creator',null,'Uploaded at least one approved game.','Upload a game.',50,false),
('rising_creator','Rising Creator','rare','creator',null,'Reached 5 followers.','Reach 5 followers.',150,false),
('hot_game','Hot Game','rare','creator',null,'A published game reached 25 total plays.','Help a game reach 25 plays.',150,false),
('how_many_rings_first_run','How Many Rings Rookie','common','game','how-many-rings','Started a dynasty in How Many Rings.','Play How Many Rings once.',25,false),
('how_many_rings_dynasty','Dynasty Builder','rare','game','how-many-rings','Won 3 or more rings in How Many Rings.','Win 3+ rings in any mode.',200,false),
('how_many_rings_perfect_decade','Perfect Decade','legendary','game','how-many-rings','Won all 10 rings in the 10-year title window.','Win 10 rings in any mode.',500,false),
('legacy_league_first_snap','First Snap','common','game','legacy-league','Started a Legacy League career.','Play Legacy League once.',25,false),
('legacy_league_champion','League Champion','epic','game','legacy-league','Built a championship-level Legacy League save.','Win big in Legacy League.',350,false),
('guess_word_solver','Word Solver','common','game','guess-the-word','Solved your first Guess The Word puzzle.','Play Guess The Word.',25,false),
('guess_word_streak','Word Streak','rare','game','guess-the-word','Built a real Guess The Word streak.','Keep winning Guess The Word rounds.',200,false),
('guess_celeb_spotter','Celeb Spotter','common','game','guess-the-celeb','Guessed your first celebrity correctly.','Play Guess The Celeb.',25,false),
('guess_celeb_master','Celeb Mastermind','epic','game','guess-the-celeb','Dominated Guess The Celeb clues.','Win difficult Guess The Celeb rounds.',350,false)
on conflict(code) do update set
  title=excluded.title,
  rarity=excluded.rarity,
  category=excluded.category,
  game_id=excluded.game_id,
  description=excluded.description,
  unlock_hint=excluded.unlock_hint,
  points=excluded.points,
  is_hidden=excluded.is_hidden;

-- Existing users get Early Build badges while beta is active.
insert into public.user_badges(user_id, badge_code)
select id, 'flashportal_pioneer' from public.user_profiles where coalesce(is_deleted,false)=false
on conflict(user_id, badge_code) do nothing;
insert into public.user_badges(user_id, badge_code)
select id, 'early_player' from public.user_profiles where coalesce(is_deleted,false)=false
on conflict(user_id, badge_code) do nothing;
insert into public.user_badges(user_id, badge_code)
select id, 'profile_started' from public.user_profiles where coalesce(is_deleted,false)=false
on conflict(user_id, badge_code) do nothing;

create or replace function public.fp_award_badge(badge_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception 'login_required'; end if;
  if not exists(select 1 from public.achievement_catalog where code = badge_code) then raise exception 'unknown_badge: %', badge_code; end if;
  insert into public.user_badges(user_id, badge_code) values(me, badge_code) on conflict(user_id, badge_code) do nothing;
  return true;
end;
$$;
grant execute on function public.fp_award_badge(text) to authenticated;

create or replace function public.fp_get_achievement_page(target_user_id uuid default null)
returns table(
  code text,
  title text,
  rarity text,
  category text,
  game_id text,
  description text,
  unlock_hint text,
  points integer,
  is_hidden boolean,
  earned boolean,
  earned_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select ac.code, ac.title, ac.rarity, ac.category, ac.game_id, ac.description, ac.unlock_hint, ac.points, ac.is_hidden,
    (ub.id is not null) as earned,
    ub.earned_at
  from public.achievement_catalog ac
  left join public.user_badges ub on ub.badge_code=ac.code and ub.user_id=coalesce(target_user_id, auth.uid())
  where ac.is_hidden=false or ub.id is not null
  order by case ac.rarity when 'legacy' then 0 when 'mythic' then 1 when 'legendary' then 2 when 'epic' then 3 when 'rare' then 4 when 'uncommon' then 5 else 6 end,
    ac.points desc, ac.title asc;
$$;
grant execute on function public.fp_get_achievement_page(uuid) to anon, authenticated;

-- Mutual-follow-only messaging for new conversations.
create or replace function public.get_or_create_direct_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  found_conversation uuid;
  mutual boolean;
begin
  if me is null then raise exception 'Not logged in'; end if;
  if other_user_id is null then raise exception 'Missing target user'; end if;
  if me = other_user_id then raise exception 'You cannot message yourself'; end if;

  select exists(select 1 from public.profile_follows where follower_id = me and following_id = other_user_id)
     and exists(select 1 from public.profile_follows where follower_id = other_user_id and following_id = me)
  into mutual;
  if coalesce(mutual,false) = false then raise exception 'Messages only open when both people follow each other'; end if;

  select cm1.conversation_id into found_conversation
  from public.conversation_members cm1
  join public.conversation_members cm2 on cm2.conversation_id = cm1.conversation_id
  where cm1.user_id = me and cm2.user_id = other_user_id
  limit 1;

  if found_conversation is not null then return found_conversation; end if;

  insert into public.conversations default values returning id into found_conversation;
  insert into public.conversation_members(conversation_id, user_id) values (found_conversation, me), (found_conversation, other_user_id) on conflict do nothing;
  insert into public.user_badges(user_id, badge_code) values(me, 'first_message') on conflict(user_id, badge_code) do nothing;
  return found_conversation;
end;
$$;
grant execute on function public.get_or_create_direct_conversation(uuid) to authenticated;

update public.social_posts sp
set comments = coalesce(c.total,0)
from (
  select post_id, count(*)::integer as total
  from public.social_comments
  where coalesce(is_deleted,false)=false
  group by post_id
) c
where sp.id = c.post_id;

notify pgrst, 'reload schema';
