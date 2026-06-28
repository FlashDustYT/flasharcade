FlashPortal V61 Actual Profile/Follow Fix

IMPORTANT:
1. Deploy this package.
2. In Supabase SQL Editor, run:
   supabase/v61_PROFILE_FOLLOW_RUN_ONCE.sql
3. Refresh the site.

What changed:
- /profile is now the real edit page and the form is visible.
- Username, display name, PFP URL, banner URL, bio, and private/public save to Supabase.
- Following requires login.
- Follow/unfollow writes to profile_follows.
- Followers count is recalculated in Supabase and should stay after refresh.
- Click followers to view follower list.
- Creator Hub is now a social feed page.
- Roadmap/About cards moved to /about.

Note:
For PFP/banner, paste an image URL for now. Direct image upload can be added later.
