FlashPortal V67 Creator Slug 404 Fix

Console showed a Supabase 404 request with select=creator_slug.
That means the app was requesting creator_slug, but your user_profiles table does not have that column.

Fixes:
- Removed creator_slug references from app queries.
- Creator/profile routing uses username/profile ID instead.
- Keeps V66 Guess The Word update.

SQL:
- No new SQL required. Your database already has user_profiles.is_deleted.
