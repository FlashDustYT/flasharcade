-- FlashPortal V68 Messages + Last Seen
-- Run this ONCE in Supabase SQL Editor after deploying V68.
-- Safe to rerun.

create extension if not exists pgcrypto;

grant usage on schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

alter table public.user_profiles
  add column if not exists last_seen_at timestamptz default now(),
  add column if not exists is_deleted boolean default false;

alter table public.social_posts
  add column if not exists is_private boolean default false,
  add column if not exists is_deleted boolean default false,
  add column if not exists updated_at timestamptz default now();

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists conversation_members_user_id_idx on public.conversation_members(user_id);
create index if not exists direct_messages_conversation_created_idx on public.direct_messages(conversation_id, created_at desc);
create index if not exists user_profiles_last_seen_idx on public.user_profiles(last_seen_at desc);

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.direct_messages enable row level security;

grant select, insert, update on public.conversations to authenticated;
grant select, insert, delete on public.conversation_members to authenticated;
grant select, insert, update on public.direct_messages to authenticated;

drop policy if exists "Members can read conversations" on public.conversations;
create policy "Members can read conversations"
on public.conversations for select
to authenticated
using (
  exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = conversations.id
      and cm.user_id = auth.uid()
  )
);

drop policy if exists "Authenticated can create conversations" on public.conversations;
create policy "Authenticated can create conversations"
on public.conversations for insert
to authenticated
with check (true);

drop policy if exists "Members can update conversations" on public.conversations;
create policy "Members can update conversations"
on public.conversations for update
to authenticated
using (
  exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = conversations.id
      and cm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = conversations.id
      and cm.user_id = auth.uid()
  )
);

drop policy if exists "Members can read conversation members" on public.conversation_members;
create policy "Members can read conversation members"
on public.conversation_members for select
to authenticated
using (
  exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = conversation_members.conversation_id
      and cm.user_id = auth.uid()
  )
);

drop policy if exists "Authenticated can create conversation members" on public.conversation_members;
create policy "Authenticated can create conversation members"
on public.conversation_members for insert
to authenticated
with check (true);

drop policy if exists "Members can read direct messages" on public.direct_messages;
create policy "Members can read direct messages"
on public.direct_messages for select
to authenticated
using (
  exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = direct_messages.conversation_id
      and cm.user_id = auth.uid()
  )
);

drop policy if exists "Members can send direct messages" on public.direct_messages;
create policy "Members can send direct messages"
on public.direct_messages for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = direct_messages.conversation_id
      and cm.user_id = auth.uid()
  )
);

drop policy if exists "Members can mark read" on public.direct_messages;
create policy "Members can mark read"
on public.direct_messages for update
to authenticated
using (
  exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = direct_messages.conversation_id
      and cm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = direct_messages.conversation_id
      and cm.user_id = auth.uid()
  )
);

create or replace function public.touch_last_seen()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_profiles
  set last_seen_at = now(), updated_at = now()
  where id = auth.uid();
end;
$$;

grant execute on function public.touch_last_seen() to authenticated;

create or replace function public.get_or_create_direct_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  found_conversation uuid;
begin
  if me is null then
    raise exception 'Not logged in';
  end if;

  if other_user_id is null then
    raise exception 'Missing target user';
  end if;

  if me = other_user_id then
    raise exception 'You cannot message yourself';
  end if;

  select cm1.conversation_id
  into found_conversation
  from public.conversation_members cm1
  join public.conversation_members cm2
    on cm2.conversation_id = cm1.conversation_id
  where cm1.user_id = me
    and cm2.user_id = other_user_id
  group by cm1.conversation_id
  having count(*) >= 1
  limit 1;

  if found_conversation is not null then
    return found_conversation;
  end if;

  insert into public.conversations default values
  returning id into found_conversation;

  insert into public.conversation_members (conversation_id, user_id)
  values
    (found_conversation, me),
    (found_conversation, other_user_id)
  on conflict do nothing;

  return found_conversation;
end;
$$;

grant execute on function public.get_or_create_direct_conversation(uuid) to authenticated;

-- Realtime publication. Ignore duplicate publication errors.
do $$
begin
  begin
    alter publication supabase_realtime add table public.direct_messages;
  exception when duplicate_object then null;
  end;
end $$;

notify pgrst, 'reload schema';
