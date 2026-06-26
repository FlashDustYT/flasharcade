# FlashArcade V9

Changes:
- Added Supabase client
- Added real Google OAuth login through Supabase
- Keeps users signed in across refreshes
- Shows Google display name and avatar in the nav
- Adds sign out by clicking the profile button
- Keeps local profile as a backup option
- Keeps neon arcade overhaul and Add Game local system

Vercel environment variables to add:
NEXT_PUBLIC_SUPABASE_URL=https://apnxmejkizttyyfagbjt.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_iOCOM6wDQoQ6royCPjX84g_ZC5oM-l-

Commit summary:
Connect FlashArcade to Supabase Google login


Patch:
- Fixed JSX typo in local profile username input.


# FlashArcade V10 Admin + Steam Style

Changes:
- Updated the "Real Login Comes Next" section to "FlashArcade is online"
- Added admin-only mode for isaac.akinola122@gmail.com
- Admin button appears only after that Google account logs in
- Admin panel can edit the platform status section
- Admin edits save locally in the browser for now
- Added Steam-style visual overhaul: darker dashboard panels, blue accents, and platform-style polish

Note:
Admin edits are local-only in this version. To make edits live for everyone, the next step is adding Supabase database tables for site_settings, games, ratings, achievements, and profiles.
