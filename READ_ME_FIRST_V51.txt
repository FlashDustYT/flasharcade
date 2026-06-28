FlashPortal V51 real-project fix

This package was edited from your uploaded flasharcade project, not from a guessed template.

What was changed:
1. Review / Rate button added to every reusable GameCard, so it appears in Library, Trending, New Releases, and Originals.
2. Featured card review link cleaned up.
3. Owner submission queue now loads only pending submissions.
4. Accept now:
   - updates Supabase status to approved
   - removes the item from the queue immediately
   - adds the approved game card to the live page immediately
   - approved games also reload from Supabase on page refresh
5. Decline now:
   - updates status to declined
   - removes the item from the queue immediately
6. Announcements now call the real sendAnnouncementNow function and save to Supabase.
7. Notification bell now displays real announcement notification cards and lets users delete them locally.
8. Broken audio slider UI has been removed from the Settings page and audio popover.
9. New Releases are sorted newest to oldest.

Required SQL:
Run this one file in Supabase SQL Editor:

supabase/v51_FIX_REVIEWS_QUEUE_NOTIFICATIONS.sql

Important:
- Do NOT type the filename into Supabase.
- Open the file, copy all SQL inside it, paste into Supabase SQL Editor, and run it.
- Do not run older V44/V46/V47/V48/V49/V50 scripts for this package.

Limit:
Accepted uploaded ZIP games can appear as cards. A ZIP cannot magically run as a browser game unless it is extracted/hosted or the creator provides a playable website URL. If a submission has a website_url, the card uses that URL. If not, it still publishes the card, but there is no real extracted playable route yet.
