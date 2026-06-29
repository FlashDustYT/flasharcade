-- FlashPortal V69 message send fix
-- Run this ONCE after V68 SQL.
-- Fixes: infinite recursion in conversation_members policies.

create or replace function public.is_conversation_member(check_conversation_id uuid, check_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = check_conversation_id
      and cm.user_id = check_user_id
  );
$$;

grant execute on function public.is_conversation_member(uuid, uuid) to authenticated;

drop policy if exists "Members can read conversations" on public.conversations;
create policy "Members can read conversations"
on public.conversations for select
to authenticated
using (public.is_conversation_member(id, auth.uid()));

drop policy if exists "Members can update conversations" on public.conversations;
create policy "Members can update conversations"
on public.conversations for update
to authenticated
using (public.is_conversation_member(id, auth.uid()))
with check (public.is_conversation_member(id, auth.uid()));

drop policy if exists "Members can read conversation members" on public.conversation_members;
create policy "Members can read conversation members"
on public.conversation_members for select
to authenticated
using (public.is_conversation_member(conversation_id, auth.uid()));

drop policy if exists "Authenticated can create conversation members" on public.conversation_members;
create policy "Authenticated can create conversation members"
on public.conversation_members for insert
to authenticated
with check (true);

drop policy if exists "Members can read direct messages" on public.direct_messages;
create policy "Members can read direct messages"
on public.direct_messages for select
to authenticated
using (public.is_conversation_member(conversation_id, auth.uid()));

drop policy if exists "Members can send direct messages" on public.direct_messages;
create policy "Members can send direct messages"
on public.direct_messages for insert
to authenticated
with check (
  sender_id = auth.uid()
  and public.is_conversation_member(conversation_id, auth.uid())
);

drop policy if exists "Members can mark read" on public.direct_messages;
create policy "Members can mark read"
on public.direct_messages for update
to authenticated
using (public.is_conversation_member(conversation_id, auth.uid()))
with check (public.is_conversation_member(conversation_id, auth.uid()));

notify pgrst, 'reload schema';
