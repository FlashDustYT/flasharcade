FlashPortal V79 actual fixes

This version changes real app files, not just SQL.

What changed:
- Achievements page now always shows the real badge guide instead of empty/old fallback.
- Current users get FlashPortal Pioneer/Early Build badge client-side and backend-side.
- Profile pages show badge rows even for private profiles and fix cramped Last seen/Online text.
- Creator Hub feed uses cached posts while refreshing so it does not flash empty/none-found as much.
- Creator Directory uses username links and a loading state instead of instant "No creators found".
- Likes/dislikes remember the current user's active reaction after refresh and sync with Supabase.
- Social backend fallback added so reactions still work if the RPC is behind.
- V79 SQL includes fixed rarity constraints, persistent reactions, comment delete, achievement catalog, and Early Build badge trigger.

Run after deploy:
supabase/v79_BACKEND_RUN_ONCE.sql

If Supabase shows the RLS warning, choose:
Run and enable RLS

Important:
Do not only upload the SQL. Replace the app/lib/components files from this zip too, then deploy.
