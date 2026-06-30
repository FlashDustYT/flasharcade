FlashPortal V77 FULL DROP-IN UPDATE

This is the full project-style package like the older updates.

How to install:
1. Copy/replace these files/folders into your FlashPortal project.
2. Run: supabase/v77_FULL_BACKEND_RUN_ONCE.sql
3. If Supabase shows the warning, choose: Run and enable RLS.
4. Deploy to Vercel.

What changed:
- FlashPortal Pioneer Legacy badge for everyone in Early Build
- New users automatically receive Pioneer until Official Launch
- Persistent likes that stay highlighted after refresh
- Dislike button
- Comment deletion by commenter or post owner
- Faster Creator Hub feed RPC
- Achievements route with Legacy-first sorting
- Cleaner reaction/comment UI

When Official Launch happens, run this SQL:
update public.platform_settings set value = 'false'::jsonb, updated_at = now() where key = 'early_build';
