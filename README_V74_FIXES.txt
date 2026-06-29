FlashPortal V74 — Notifications, Community Feed, Badge Guide, UI polish

Run once in Supabase SQL Editor:
supabase/v74_FEED_COMMENTS_LIKES_BADGES_RUN_ONCE.sql

What changed:
- Old test/testing platform announcements are disabled by the SQL.
- Dismissing a notification is per-user, so the owner can dismiss it without removing it for new users.
- Community Feed hearts/likes now work.
- Community Feed comments now work.
- Creator Hub uses cached content while refreshing, so it feels faster and does not flash a fake empty state.
- Added /badges page showing 50+ available badges and how to earn them.
- Added badge guide links from Creator Hub and Profile.
- Added UI polish for feed cards, comments, badge panels, and quick links.

SQL note:
Run V73 first if you have not already. Then run V74.
