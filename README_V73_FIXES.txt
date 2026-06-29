FlashPortal V73 — Speed, account delete, badges, creator achievements

Run once in Supabase SQL Editor:
supabase/v73_SPEED_DELETE_BADGES_RUN_ONCE.sql

Changes:
- Creator Directory / Creator Hub show loading states instead of flashing false “none found” messages.
- Creator Hub reads public posts more directly, so Community Feed + Profile posts are more reliable.
- Users can delete their own FlashPortal profile/account record from /profile.
- Owner dashboard has User Management to load/search/remove FlashPortal accounts.
- Expanded profile badges to 50+ achievements across Common, Uncommon, Rare, Epic, and Legendary.
- Creators can choose/add game-specific badges/achievements during upload.
- Game achievement tables added for future in-game unlock tracking.

Notes:
- “Delete account” is a FlashPortal soft-delete: it hides/removes the profile inside your app. It does not delete the user from Supabase Auth. Full Auth-user deletion needs a server/admin API later.
- For GitHub login, still enable GitHub in Supabase Auth Providers with GitHub Client ID + Secret.
