FlashPortal V76 Real Fix File

This is the normal update-file style:
- Run `supabase/V76_REAL_FIX.sql` in Supabase.
- Copy `lib/social.ts` into your project.
- Copy `components/SocialPostCard.tsx` into your project.
- Paste `V76_CURSOR_PROMPT.md` into Cursor if you want Cursor to wire the files into your existing pages.

This fixes:
- persistent likes
- dislikes
- comment delete by comment owner or post owner
- less buggy heart button
- better achievement catalog
- faster feed indexes
