-- FlashPortal V42 backend check
-- Run after V41 SQL if uploads or play counts still fail.

alter table public.game_submissions add column if not exists title text;
alter table public.game_submissions add column if not exists category text;
alter table public.game_submissions add column if not exists description text;
alter table public.game_submissions add column if not exists website_url text;
alter table public.game_submissions add column if not exists zip_path text;
alter table public.game_submissions add column if not exists thumbnail_path text;
alter table public.game_submissions add column if not exists status text not null default 'pending';

insert into public.game_play_counts (game_id, plays)
values
  ('how-many-rings', 0),
  ('legacy-league', 0),
  ('guess-the-celeb', 0),
  ('guess-the-word', 0)
on conflict (game_id) do nothing;

notify pgrst, 'reload schema';
