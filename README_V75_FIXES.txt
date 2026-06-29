FlashPortal V75 — persistent feed + progress tracking

Run SQL once:
supabase/v75_PERSISTENT_FEED_PROGRESS_RUN_ONCE.sql

What this fixes:
- Community Feed likes/comments now use backend RPC functions so they stay after refresh.
- Creator Hub uses cache first, then refreshes in the background, so page switches feel faster.
- Achievements tab is no longer “coming soon.” It now shows:
  - earned badges
  - available badges
  - game achievement examples
  - links to the full badge guide
- V75 SQL gives existing profiles starter badges like Early Player / Profile Started / Fresh Face.
- Version card updated to V75.

Important:
- Run V74 first if you never ran it.
- Then run V75.
