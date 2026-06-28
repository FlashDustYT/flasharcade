# V44 Upload Fix Steps

The error `permission denied for table game_submissions` means Supabase RLS policies are blocking the insert.

Fix:
1. Open Supabase.
2. Go to SQL Editor.
3. Create a New Query.
4. Copy everything from `supabase/v44_upload_permissions.sql`.
5. Paste it.
6. Click Run.
7. Refresh FlashPortal and try the upload again.

The first free upload now locks after a creator has a pending or approved submission.
Rejected submissions do not lock the free option.
