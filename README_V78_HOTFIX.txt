FlashPortal V78 Hotfix

This fixes the regression you saw:
- Home Achievements tab no longer shows the old "coming soon" screen.
- /achievements uses the real badge catalog and earned badge data.
- Existing and new accounts get the FlashPortal Pioneer Legacy badge while early_build is true.
- Creator Directory now shows a loading state instead of flashing "No creators found."
- Creator Directory View Profile uses username instead of id.
- Creator Hub uses a small session cache so the feed feels less empty while Supabase loads.
- Reaction/comment backend is stabilized with a V78 SQL hotfix.

Run SQL:
supabase/v78_BACKEND_HOTFIX_RUN_ONCE.sql

If Supabase warns about RLS, click:
Run and enable RLS
