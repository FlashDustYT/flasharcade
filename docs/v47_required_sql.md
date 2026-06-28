# V47 SQL

Run this file in Supabase SQL Editor:

`supabase/v47_reviews_upload_audio_fix.sql`

This fixes:
- missing `creator_email` on `game_submissions`
- missing review columns
- missing/invalid rating column
- duplicate policy errors from older upload SQL
- upload/review permissions
