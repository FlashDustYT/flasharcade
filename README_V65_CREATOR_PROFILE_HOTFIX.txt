FlashPortal V65 Creator/Profile Hotfix

Fixes:
- Creator Hub no longer breaks because of missing user_profiles.is_deleted.
- View Profile uses profile ID links and a safer lookup, so it should stop saying profile not found.
- Message no longer opens a blank browser/mail window; it shows an in-app status until real DMs are built.
- Add image button is smaller/cleaner.
- Post/profile queries avoid fragile schema-cache filters and filter safely in app.

SQL:
Run once in Supabase:
supabase/v65_PROFILE_POSTS_HOTFIX_RUN_ONCE.sql
