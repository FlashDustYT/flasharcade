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


# FlashArcade V15 Stripe Starter

Changes:
- Added Stripe dependencies
- Added `/api/create-checkout-session` API route
- Added Stripe Checkout buttons for:
  - Game Submission: $1.99
  - Featured 7 Days: $4.99
  - Featured 30 Days: $9.99
- Added checkout success page
- Added checkout cancel page
- Added Creator Studio monetization panel
- Game submission card now starts Stripe Checkout
- Vercel installs Stripe automatically from package.json

Required Vercel environment variables:
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_SITE_URL=https://arcade.flashdust.dev

Commit summary:
Add Stripe checkout starter flow


Patch:
- Fixed missing lucide-react imports for Stripe checkout UI.
