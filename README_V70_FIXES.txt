FlashPortal V70 — Live ratings + message badges

SQL:
- If V68 + V69 are already run, V70 does not require a major schema change.
- You can safely run: supabase/v70_MESSAGE_BADGES_AND_RATINGS_NOTE.sql

Fixes:
- Messages support emoji text, plus quick emoji buttons in chat.
- Incoming messages show a bell notification badge only for the receiver.
- Messages inbox shows unread counts/badges.
- Opening a conversation marks incoming messages as read.
- Ratings average all users' ratings together.
- Homepage ratings update live from Supabase/review cache instead of needing manual refresh.
