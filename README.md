# FlashArcade V9

Changes:
- Added Supabase client
- Added real Google OAuth login through Supabase
- Keeps users signed in across refreshes
- Shows Google display name and avatar in the nav
- Adds sign out by clicking the profile button
- Keeps local profile as a backup option
- Keeps neon arcade overhaul and Add Game local system

Vercel environment variables to add:
NEXT_PUBLIC_SUPABASE_URL=https://apnxmejkizttyyfagbjt.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_iOCOM6wDQoQ6royCPjX84g_ZC5oM-l-

Commit summary:
Connect FlashArcade to Supabase Google login


Patch:
- Fixed JSX typo in local profile username input.


# FlashArcade V10 Admin + Steam Style

Changes:
- Updated the "Real Login Comes Next" section to "FlashArcade is online"
- Added admin-only mode for isaac.akinola122@gmail.com
- Admin button appears only after that Google account logs in
- Admin panel can edit the platform status section
- Admin edits save locally in the browser for now
- Added Steam-style visual overhaul: darker dashboard panels, blue accents, and platform-style polish

Note:
Admin edits are local-only in this version. To make edits live for everyone, the next step is adding Supabase database tables for site_settings, games, ratings, achievements, and profiles.


# FlashArcade V11 Optimization + Account Menu

Changes:
- Clicking the logged-in account now opens an account menu instead of instantly logging out
- Added explicit Sign Out option
- Added Admin Panel shortcut inside account menu for the owner account
- Reduced lag by disabling heavy scanline/orbit effects
- Removed expensive backdrop blur effects
- Disabled repeated shine animation
- Reduced heavy shadows and hover transforms
- Added reduced-motion support


# FlashArcade V12 Legacy League

Changes:
- Added Legacy League game files into `public/games/legacy-league/`
- Added `/legacy-league` embedded game player page
- Updated Legacy League card from Coming Soon to Playable
- Play button now opens Legacy League inside FlashArcade
- Direct game file path: `/games/legacy-league/`

Commit summary:
Add Legacy League as playable game


# FlashArcade V13 FDC Badge

Changes:
- Added FDC badge next to official FlashDust games
- How Many Rings and Legacy League show the FDC badge
- Community-added games do not show the badge
- Featured game title also shows the badge

Commit summary:
Add FDC badge to official games


# FlashArcade V14 Legacy League Asset Fix

Changes:
- Fixed Legacy League asset paths so CSS/JS/images load correctly from `/games/legacy-league/`
- Updated embedded Legacy League route to load `/games/legacy-league/index.html`
- Keeps FDC badges and prior V13 changes

Commit summary:
Fix Legacy League embedded asset loading


# FlashArcade V20 Safe Stripe

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


# FlashArcade V21 Arcade Checkout + Ratings

Changes:
- Added Publish link to the main arcade nav
- Main Add/Publish buttons now go to `/creator-checkout`
- Header/brand no longer sticks and overlaps while scrolling
- Every game can now be rated
- Ratings show average + rating count per game
- Ratings save locally and also sync globally through Supabase if the `game_ratings` table exists

Supabase setup:
Run `supabase/game_ratings.sql` in Supabase SQL Editor to enable real global ratings.

Commit summary:
Add arcade checkout link and global game ratings


# FlashArcade V22 Game Rating Prerender Fix

Changes:
- Fixed `gameRating is not defined` prerender error.
- Rating UI now calculates each game's rating safely inside the card render.
- Keeps arcade checkout link and Supabase global ratings.

Commit summary:
Fix game rating prerender error


# FlashArcade V23 Creator Update

Changes:
- Added Creator Level system UI
- Added FlashDust creator profile panel
- Added FDC Original badge language for official games
- Added Community badge for non-FDC games
- Added Creator stats panel
- Added marketplace revenue-split foundation display (85% creator / 15% FlashArcade)
- Added review placeholder row on game cards
- Added Supabase SQL foundation for creator profiles, reviews, and future payouts

Optional Supabase setup:
Run `supabase/creator_marketplace_foundation.sql` in Supabase SQL Editor.

Commit summary:
Add creator levels and marketplace foundation
