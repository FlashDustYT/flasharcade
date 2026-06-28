FlashPortal V54

Changes:
- Extra Game Upload is protected so it uses the $1.99 Stripe link, not Featured 30 Days.
- Continue Playing closes automatically after about 8 seconds.
- Creator Hub tab added with next-stage ideas: profiles, weekly trending, daily challenge, badges, wishlist, creator follows.
- Game-card Save/Review buttons are smaller and cleaner.
- Volume sliders persist and update live gain. 0% mutes.

SQL:
No required SQL for V54 if V52/V53 SQL already ran. Optional file: supabase/v54_optional_polish.sql

Important:
After changing Vercel environment variables, redeploy the project. NEXT_PUBLIC_* variables are baked into the build.
