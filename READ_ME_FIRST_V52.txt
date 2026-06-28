FlashPortal V52 release tweaks

What changed:
- Added Save/heart buttons on game cards so games go to Playlist.
- Playlist updates immediately after saving/unsaving.
- Added Unfriend button.
- Owner Private/Delete now persists using Supabase game_visibility plus local fallback.
- Rejected submissions disappear from the queue.
- First free upload locks after one pending/approved submission.
- Paid Extra Upload can unlock one extra slot after Stripe redirects to /checkout/success.
- Removed broken audio control cards from Settings.

SQL:
Run this once in Supabase SQL Editor:
supabase/v52_RELEASE_TWEAKS.sql

You do not need to rerun V51 unless your database is missing the older tables.
