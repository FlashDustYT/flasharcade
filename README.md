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
