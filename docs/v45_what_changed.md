# FlashPortal V45

Important:
Run `supabase/v45_backend_upload_reviews_friends.sql` to fix the upload permission error.

Changes:
- Audio buttons open a popup with real volume sliders.
- 0% means muted.
- AVG rating ignores unrated/new games, so it won't show 1.9 because of zero ratings.
- Added `/reviews/[gameId]` pages for public reviews.
- Added Friends tab foundation.
