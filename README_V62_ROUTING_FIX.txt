FlashPortal V62 Routing/Wiring Fix

This fixes the reason V61 looked unchanged:
the new /profile and /creator-hub pages existed, but the main UI/account menu still opened old in-page sections.

Deploy this package.

SQL:
No new SQL should be needed if you already ran:
supabase/v61_PROFILE_FOLLOW_RUN_ONCE.sql

If profile/follow tables still error, run that V61 SQL once more.

What changed:
- Account Settings now routes to /profile.
- Creator Hub now routes to /creator-hub.
- /account redirects to /profile.
- V62 update appears in Updates.
- Added CSS to suppress old roadmap blocks on the wrong page.
