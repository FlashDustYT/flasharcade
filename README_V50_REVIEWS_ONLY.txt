FlashPortal V50 — Reviews/Ratings Focused Fix

This version only focuses on reviews and ratings.

What changed:
- Adds visible Review / Rate buttons.
- Adds /reviews page.
- Adds /reviews/[gameId] pages.
- Users can click stars from 1 to 5.
- Users can write and post reviews.
- Reviews save to Supabase when SQL is run.
- Before SQL, reviews save locally as fallback.
- Old broken audio sliders are hidden.

SQL:
Run only this if public review saving fails:
supabase/v50_reviews_ratings.sql

Do not run old SQL for this review fix.
