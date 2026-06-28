FlashPortal V53 Release Polish

Run this SQL only if friend requests, notifications, owner delete/private, or announcements are still stale:

supabase/v53_RELEASE_POLISH.sql

Main changes:
- smaller Review/Rate and Save buttons
- playlist saves per signed-in account
- received/sent friend requests are separated correctly
- unfriend remains available
- notification bell shows a small badge count
- announcements remain dismissible per user
- owner Delete hides removed games from Game Management and public lists
- volume sliders are back and control UI clicks/music volume
