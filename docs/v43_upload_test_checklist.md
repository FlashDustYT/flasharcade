# FlashPortal V43 Upload Test

I cannot confirm a live upload from here because it requires your browser session, Supabase auth, and storage permissions. The V43 upload page is wired to:

- Supabase Auth session
- storage bucket: game-files
- storage bucket: game-thumbnails
- table: game_submissions

Test steps:
1. Log in.
2. Go to Publish.
3. Upload a ZIP with index.html somewhere inside it.
4. Upload any thumbnail. It does not need to match the ZIP filename.
5. Submit.
6. In Supabase Table Editor, check `game_submissions`.
7. In Storage, check `game-files` and `game-thumbnails`.

If it fails, run:
- supabase/v41_backend_fixes.sql
- supabase/v42_backend_check.sql
- supabase/v43_social_upload_backend.sql
