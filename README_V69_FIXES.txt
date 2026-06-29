FlashPortal V69 Message + Avatar + Rating Fix

Run this SQL once in Supabase:
supabase/v69_MESSAGES_RLS_FIX_RUN_ONCE.sql

This fixes:
- Message send infinite recursion error
- Conversation member read policy
- Direct message insert policy

Code fixes:
- Avatars/profile pictures are contained inside their frames
- Homepage game cards load live average ratings from game_reviews
- Rating-only review page is kept
- Status text now points to V69 SQL for message errors
