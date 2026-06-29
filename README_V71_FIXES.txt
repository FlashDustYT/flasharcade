FlashPortal V71 — Community feed, video posts, emoji picker, security prep

Run once in Supabase SQL Editor:
supabase/v71_FEED_VIDEO_SECURITY_RUN_ONCE.sql

What changed:
- Profile posts now publish to the Community Feed.
- Public posts can be read in Creator Hub through Supabase policies.
- Posts support image and video media.
- Post media uploads to a public Supabase Storage bucket named profile-media.
- Message screen has quick emojis plus a bigger emoji picker.
- Profile page now includes GitHub login/connect and password reset buttons.
- This prepares the security pass; full 2FA setup is next through Supabase Auth settings.

Important:
- No app-side video length limit is set.
- Actual upload limits still depend on your Supabase project/storage limits.
