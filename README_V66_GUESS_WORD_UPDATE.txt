FlashPortal V66

What changed:
- Updated public/games/guess-the-word with the new uploaded Guess The Word ZIP.
- Preserved the V65 creator/profile fixes.
- Updated the version card/changelog to V66.
- Message button now explains that real direct messaging is the next backend feature instead of acting broken.

SQL:
- No SQL needed for the Guess The Word update.
- If you have not run V65 yet, run:
  supabase/v65_PROFILE_POSTS_HOTFIX_RUN_ONCE.sql

Direct Messages Plan:
To build real messages, the next version needs:
1. conversations table
   - id
   - created_at
   - updated_at
2. conversation_members table
   - conversation_id
   - user_id
   - created_at
3. direct_messages table
   - id
   - conversation_id
   - sender_id
   - body
   - created_at
   - read_at
4. RLS policies:
   - only conversation members can read messages
   - only conversation members can send messages
5. UI:
   - /messages inbox
   - /messages/[conversationId]
   - Message button creates/fetches a conversation and opens it
   - notification badge for unread messages

Recommended next build:
V67 Direct Messages.
