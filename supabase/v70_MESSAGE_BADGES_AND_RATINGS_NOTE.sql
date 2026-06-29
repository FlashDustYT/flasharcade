-- FlashPortal V70
-- If you already ran V68 + V69, no required schema change is needed.
-- This file is safe to run anyway; it confirms the columns/tables V70 uses.

alter table public.direct_messages
  add column if not exists read_at timestamptz;

create index if not exists direct_messages_unread_idx
on public.direct_messages(conversation_id, sender_id, read_at);

notify pgrst, 'reload schema';
