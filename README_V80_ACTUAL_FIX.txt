FlashPortal V80 Actual Fix

What changed:
- Profile only shows 1 badge pill, with +N button for more.
- Clicking the badge/+N opens a blurred-background badge modal with all badges and a close button.
- Profile post comments now actually open and show the comment list.
- Comment author and post owner can delete comments.
- Messages now require mutual following before a new conversation opens.
- How Many Rings now syncs achievements from local best score:
  - Rookie: any saved run
  - Dynasty Builder: 3+ rings
  - Perfect Decade: 10 rings, any mode
- Backend function fp_award_badge added for game achievement sync.
- Version label updated to V80.

Deploy files, then run:
supabase/v80_BACKEND_RUN_ONCE.sql

If Supabase asks about RLS, choose Run and enable RLS.
