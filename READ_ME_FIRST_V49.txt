FLASHPORTAL V49 — DO THIS EXACTLY

1) Upload/deploy this V49 project to GitHub/Vercel.

2) In Supabase:
   - Go to SQL Editor
   - Click + New Query
   - Open this file from the zip:
     supabase/v49_RUN_THIS_ONCE.sql
   - Copy the whole file
   - Paste it
   - Click Run

3) You only need to run that ONE SQL file.
   Do NOT run V44, V46, V47, or V48 again.

4) After Supabase says Success:
   - wait 30 seconds
   - refresh FlashPortal
   - log out/log back in if needed

This SQL is required for:
- submission queue
- upload permissions
- reviews/ratings table
- announcement notifications
- friend requests
- play counts

If the site still says “Run SQL once, then reload,” it means either:
- the SQL did not fully succeed,
- the deployed site is still an older version,
- or Supabase schema cache has not refreshed yet.

If Supabase shows a red error, send that exact error.
