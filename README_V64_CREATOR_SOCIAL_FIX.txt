FlashPortal V64 Creator/Social Fix

Fixes:
- Creators and Creator Hub are no longer the same:
  - Creators -> /creators directory for finding/interacting with creators.
  - Creator Hub -> /creator-hub community feed/posts.
- Profile editor supports choosing image files for profile picture, banner, and post images.
- Profile posts can be made private/public or deleted by the owner.
- Public profile lookup is more forgiving, so /profile/username works more reliably.
- Online indicators appear for recently active creators.
- Left version card now says V64 with the correct update text.

SQL needed:
Run once:
supabase/v64_SOCIAL_PROFILE_POSTS_RUN_ONCE.sql

Important:
If a user still shows “profile not found,” that account needs to log in and click Save Profile once at /profile.
