FlashPortal V81 Actual Fix

Replace these files in your project, commit, and deploy.
Then run:
  supabase/v81_BACKEND_RUN_ONCE.sql

Fixes included:
- Comments no longer use the broken social_comments -> user_profiles nested relationship.
- Comment lists load even when Supabase schema cache has no FK relationship.
- Profile badge popup loads all earned badges through fp_get_achievement_page.
- Mutual-follow-only messaging is kept in the backend.
- How Many Rings badge sync retries correctly and reads the local best more safely.
- V81 text shows in the sidebar/update note.

Game badges note:
How Many Rings badges are awarded from the wrapper page by reading howManyRingsBest and iframe postMessage. If a custom game is added later, that game should call:
  window.parent.postMessage({ type: "flashportal-game-achievement", gameId: "your-game-id", badgeCode: "your_badge_code" }, window.location.origin)
or the wrapper must translate the game score into fp_award_badge calls.
