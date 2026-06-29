# FlashPortal V76 Real Fix Instructions for Cursor

Apply these changes to the existing project.

## Files included
- `supabase/V76_REAL_FIX.sql`
- `lib/social.ts`
- `components/SocialPostCard.tsx`

## What to do
1. Copy `lib/social.ts` into your project at `lib/social.ts`.
2. Copy `components/SocialPostCard.tsx` into your project at `components/SocialPostCard.tsx`.
3. Update `app/creator-hub/page.tsx` to use this `SocialPostCard`.
4. Run `supabase/V76_REAL_FIX.sql` once in Supabase.
5. Deploy.

## Creator Hub page requirements
In `app/creator-hub/page.tsx`, fetch:
- current user
- current profile
- social_posts where `is_deleted = false` and `is_private = false`
- user_profiles for post authors
- social_comments where `is_deleted = false`
- social_post_reactions for current user

Build each post object like:
```ts
{
  ...post,
  profile: profilesById[post.user_id],
  commentsList: commentsByPostId[post.id],
  my_reaction: reactionsByPostId[post.id] ?? null
}
```

Then render:
```tsx
<SocialPostCard
  key={post.id}
  post={post}
  currentUserId={user?.id}
  currentProfile={currentProfile}
/>
```

## Important fixes
- Do not show “No posts yet” while loading.
- Show skeleton cards while loading.
- Do not refetch whole feed after like/comment/delete.
- Use optimistic UI from the included component.
- The Delete button should show if:
  - current user made the comment OR
  - current user owns the post.
- Keep post ids as numbers/bigints, not UUIDs.

## Achievements page
Update `app/achievements/page.tsx`:
- Fetch `achievement_catalog`
- Fetch `user_badges` for the logged-in user
- Show earned badges, locked badges, rarity, unlock hint, and points
- Use better labels:
  common, uncommon, rare, epic, legendary, mythic
- Do not call bland achievements “Epic” unless they require real effort.

## Loading improvements
- Use `Promise.all` for independent Supabase calls.
- Add indexes from SQL.
- Use local state updates after actions.
- Only show empty states after loading is complete.
