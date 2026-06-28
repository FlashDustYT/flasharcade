# V46 Required Supabase Steps

Run this file in Supabase SQL Editor:

`supabase/v46_backend_queue_notifications_reviews_friends.sql`

This is required because:
- The upload form can submit successfully, but Owner cannot see the queue unless the Owner read policy is active.
- Reviews need `game_reviews`.
- Announcements need `platform_announcements`.
- Friend requests need target-only accept behavior.

After running:
1. Refresh FlashPortal.
2. Upload from a normal account.
3. Log into Owner account.
4. Go to Owner/Admin Tools.
5. Click Load Queue.
