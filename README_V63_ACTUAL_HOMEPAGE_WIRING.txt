FlashPortal V63 Actual Homepage Wiring

This is the targeted fix for what was still broken:
- The homepage's real handleTabChange was still only doing setActiveTab(tabId).
- That meant Account Settings/Creator Hub kept showing old in-page sections.
- V63 changes handleTabChange itself so:
  settings/profile/account -> /profile
  creators/creatorHub -> /creator-hub
  about -> /about

Also:
- The old local Creator Profile follow button now refuses to follow unless logged in.

SQL:
No new SQL needed if V61 SQL was already run.
If /profile errors about missing user_profiles/profile_follows/social_posts, run:
supabase/v61_PROFILE_FOLLOW_RUN_ONCE.sql
