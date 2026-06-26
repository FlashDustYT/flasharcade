-- FlashPortal V40.2 schema hotfix
-- Run this in Supabase SQL Editor if uploads complain about missing columns.

alter table public.game_submissions
add column if not exists title text;

alter table public.game_submissions
add column if not exists game_title text;

alter table public.game_submissions
add column if not exists category text;

alter table public.game_submissions
add column if not exists description text;

alter table public.game_submissions
add column if not exists website_url text;

alter table public.game_submissions
add column if not exists zip_path text;

alter table public.game_submissions
add column if not exists thumbnail_path text;

alter table public.game_submissions
add column if not exists status text not null default 'pending';

alter table public.game_submissions
add column if not exists created_at timestamptz not null default now();

alter table public.game_submissions
add column if not exists updated_at timestamptz not null default now();

-- Force PostgREST/Supabase API to refresh its schema cache.
notify pgrst, 'reload schema';
