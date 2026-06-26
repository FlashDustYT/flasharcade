# FlashPortal V9

Changes:
- Added Supabase client
- Added real Google OAuth login through Supabase
- Keeps users signed in across refreshes
- Shows Google display name and avatar in the nav
- Adds sign out by clicking the profile button
- Keeps local profile as a backup option
- Keeps neon portal overhaul and Add Game local system

Vercel environment variables to add:
NEXT_PUBLIC_SUPABASE_URL=https://apnxmejkizttyyfagbjt.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_iOCOM6wDQoQ6royCPjX84g_ZC5oM-l-

Commit summary:
Connect FlashPortal to Supabase Google login


Patch:
- Fixed JSX typo in local profile username input.


# FlashPortal V10 Admin + Steam Style

Changes:
- Updated the "Real Login Comes Next" section to "FlashPortal is online"
- Added admin-only mode for isaac.akinola122@gmail.com
- Admin button appears only after that Google account logs in
- Admin panel can edit the platform status section
- Admin edits save locally in the browser for now
- Added Steam-style visual overhaul: darker dashboard panels, blue accents, and platform-style polish

Note:
Admin edits are local-only in this version. To make edits live for everyone, the next step is adding Supabase database tables for site_settings, games, ratings, achievements, and profiles.


# FlashPortal V11 Optimization + Account Menu

Changes:
- Clicking the logged-in account now opens an account menu instead of instantly logging out
- Added explicit Sign Out option
- Added Admin Panel shortcut inside account menu for the owner account
- Reduced lag by disabling heavy scanline/orbit effects
- Removed expensive backdrop blur effects
- Disabled repeated shine animation
- Reduced heavy shadows and hover transforms
- Added reduced-motion support


# FlashPortal V12 Legacy League

Changes:
- Added Legacy League game files into `public/games/legacy-league/`
- Added `/legacy-league` embedded game player page
- Updated Legacy League card from Coming Soon to Playable
- Play button now opens Legacy League inside FlashPortal
- Direct game file path: `/games/legacy-league/`

Commit summary:
Add Legacy League as playable game


# FlashPortal V13 FDC Badge

Changes:
- Added FDC badge next to official FlashDust games
- How Many Rings and Legacy League show the FDC badge
- Community-added games do not show the badge
- Featured game title also shows the badge

Commit summary:
Add FDC badge to official games


# FlashPortal V14 Legacy League Asset Fix

Changes:
- Fixed Legacy League asset paths so CSS/JS/images load correctly from `/games/legacy-league/`
- Updated embedded Legacy League route to load `/games/legacy-league/index.html`
- Keeps FDC badges and prior V13 changes

Commit summary:
Fix Legacy League embedded asset loading


# FlashPortal V20 Safe Stripe

Important:
- Starts from stable V14.
- Does not modify app/page.jsx/homepage.
- Stripe checkout is isolated on /creator-checkout.
- This prevents the import corruption from previous deployments.

New route:
- /creator-checkout

Changes:
- Added Stripe dependency
- Added API route: /api/create-checkout-session
- Added checkout success/cancel pages
- Added safe creator checkout test page

Commit summary:
Add safe isolated Stripe checkout


# FlashPortal V21 Portal Checkout + Ratings

Changes:
- Added Publish link to the main portal nav
- Main Add/Publish buttons now go to `/creator-checkout`
- Header/brand no longer sticks and overlaps while scrolling
- Every game can now be rated
- Ratings show average + rating count per game
- Ratings save locally and also sync globally through Supabase if the `game_ratings` table exists

Supabase setup:
Run `supabase/game_ratings.sql` in Supabase SQL Editor to enable real global ratings.

Commit summary:
Add portal checkout link and global game ratings


# FlashPortal V22 Game Rating Prerender Fix

Changes:
- Fixed `gameRating is not defined` prerender error.
- Rating UI now calculates each game's rating safely inside the card render.
- Keeps portal checkout link and Supabase global ratings.

Commit summary:
Fix game rating prerender error


# FlashPortal V23 Creator Update

Changes:
- Added Creator Level system UI
- Added FlashDust creator profile panel
- Added FDC Original badge language for official games
- Added Community badge for non-FDC games
- Added Creator stats panel
- Added marketplace revenue-split foundation display (85% creator / 15% FlashPortal)
- Added review placeholder row on game cards
- Added Supabase SQL foundation for creator profiles, reviews, and future payouts

Optional Supabase setup:
Run `supabase/creator_marketplace_foundation.sql` in Supabase SQL Editor.

Commit summary:
Add creator levels and marketplace foundation


# FlashPortal V26 Discovery Update

Changes:
- Added storefront-style Discover section
- Added Trending Now
- Added Most Played
- Added Top Rated
- Added New Releases
- Added FDC Originals
- Added Hidden Gems
- Added Community Spotlight
- Added horizontal discovery rows
- Added mini metadata: rating + plays
- Added Discover nav link

Notes:
- Some discovery values are calculated from existing game metadata and rating data.
- As more real analytics are connected to Supabase, these rows can become fully real.

Commit summary:
Add discovery storefront rows


# FlashPortal V27 Free First + Honest Stats

Changes:
- Creator checkout now includes a $0 first game submission option.
- Paid upload is now labeled as an extra game upload.
- Removed fake follower/play calculations from creator stats.
- Creator stats now use:
  - real official game count
  - listed play metadata from official games
  - followers set to 0 until the follower system is live
- Added honest copy explaining stats are connected values or existing metadata only.

Commit summary:
Add free first upload and honest creator stats


# V28 Creator Portal
- Added /creator/upload
- First free upload opens upload portal.
- UI foundation for moderation workflow.


# V29 Functional Uploads

Changes:
- `/creator/upload` is now functional.
- Users must be signed in to submit.
- Uploads thumbnail to Supabase Storage bucket `game-thumbnails`.
- Uploads game ZIP to Supabase Storage bucket `game-files`.
- Inserts a row into `public.game_submissions`.
- Submission status starts as `pending`.
- FDC Original is automatically true for `isaac.akinola122@gmail.com`.
- Shows success/error messages instead of redirecting home.

Required Supabase setup:
- Public bucket: `game-files`
- Public bucket: `game-thumbnails`
- SQL: `supabase/game_submissions_uploads.sql`

Commit summary:
Add functional creator game uploads


# V31 FlashPortal Rebrand + Cloud Saves

Changes:
- Rebranded user-facing FlashPortal text to FlashPortal.
- Kept Supabase table names, storage buckets, auth, and Stripe unchanged.
- Added `supabase/cloud_saves.sql`.
- Added `lib/cloudSaves.js`.
- Added cloud-save badge/message foundation.
- When a signed-in user launches a game, FlashPortal now creates/updates a lightweight cloud save record:
  - game id
  - title
  - last played time
  - launch count

Important:
- This is cloud-save foundation, not full automatic iframe/localStorage capture yet.
- Full in-game save syncing requires games to use the FlashPortal save API or a controlled game wrapper.

Supabase step:
Run `supabase/cloud_saves.sql` in Supabase SQL Editor.

Commit summary:
Rebrand to FlashPortal and add cloud save foundation


# V31.1 Build Fix

Fixes:
- Removed broken `cloudSaveStatus` homepage render that caused Vercel prerender failure.
- Keeps FlashPortal rebrand.
- Keeps cloud save SQL and helper.
- Still tracks launch cloud-save metadata for signed-in players.

Commit summary:
Fix FlashPortal cloud save build error


# V32 FlashPortal UI + Thumbnail Refresh

Changes:
- Stronger FlashPortal rebrand pass across user-facing files.
- Added dark/light theme foundation.
- Dark mode uses black/orange FlashPortal styling.
- Light mode keeps the older blue/green feel.
- Added clean vector thumbnails:
  - `/public/game-thumbnails/how-many-rings.svg`
  - `/public/game-thumbnails/legacy-league.svg`
- Added thumbnail metadata to existing games where possible.
- Added CSS to render thumbnails inside existing game art containers.

Commit summary:
Refresh FlashPortal UI and add official game thumbnails


# V32.1 Build Fix

Fixes:
- Fixed invalid JSX caused by the theme toggle being inserted inside the login conditional.
- Theme toggle is now a safe floating button.
- Keeps V32 UI refresh and official thumbnails.

Commit summary:
Fix FlashPortal theme toggle JSX


# V32.2 Stats Icon Build Fix

Fixes:
- Restored the Achievements stat icon to `<Trophy />`.
- Removed broken thumbnail injection inside the stats section.
- Keeps FlashPortal rebrand, dark/light theme, and official game thumbnails.

Commit summary:
Fix broken stats icon JSX


# FlashPortal V33 Clean Platform Rebuild

Major changes:
- Rebuilt homepage cleanly instead of patching broken JSX.
- Full FlashPortal branding.
- Black/orange dark mode.
- Blue/green light mode.
- Working theme toggle.
- New Updates tab/changelog.
- Better accessible navigation.
- Improved official game thumbnails.
- Play count updates locally on launch.
- Signed-in game launches update cloud-save metadata.
- Keeps existing Supabase tables/storage/Stripe setup.

Commit summary:
Rebuild FlashPortal homepage with updates tab


# V33.1 Duplicate Home Fix

Fixes:
- Removed duplicate `export default function Home()` from `app/page.jsx`.
- Keeps the V33 clean platform rebuild, Updates tab, themes, and thumbnails.

Commit summary:
Fix duplicate Home component
