FlashPortal V72 — Login ratings, post audience, badges

Run once in Supabase SQL Editor:
supabase/v72_LOGIN_RATINGS_FEED_BADGES_RUN_ONCE.sql

Changes:
- Rating/review page now requires login before submitting.
- Logged-out account dropdown now shows Google and GitHub login buttons.
- GitHub still needs to be enabled in Supabase Auth Providers or Supabase will show unsupported provider.
- Profile post composer lets you choose:
  1) Community Feed + Profile
  2) Profile Only
- Added permanent user_badges table.
- Added starter badges: Early Player, First Post, First Rating, Creator Start, Social Spark, Rising Creator, Hot Game.
- Badges show on your profile page and public profile pages.
- Media posts still support images/videos through the profile-media storage bucket.

Next security step:
- Enable GitHub in Supabase Auth > Providers.
- For 2FA/MFA, enable MFA in Supabase Auth settings, then we can add a site UI for enrolling/verifying factors.
