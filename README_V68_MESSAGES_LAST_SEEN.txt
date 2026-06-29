FlashPortal V68 Messages + Last Seen

Run SQL:
supabase/v68_MESSAGES_LAST_SEEN_RUN_ONCE.sql

Then deploy the ZIP.

Adds:
- Real /messages inbox
- Real /messages/[conversationId] chat page
- Message buttons create/open conversations
- Realtime message subscription on the chat page
- Last seen labels instead of stale online text
- Trending sorts by plays, rating, newest
- Creator board sorts by followers
- Avatar cropping polish
- Ratings no longer require a written review

Important:
Supabase Realtime should be enabled for direct_messages. The SQL tries to add it to the realtime publication automatically.
