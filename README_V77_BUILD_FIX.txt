FlashPortal V77 build fix

Fixes Vercel build error:
DEFAULT_GAME_ACHIEVEMENTS is not exported from ../../lib/badges.

What changed:
- lib/badges.js now exports DEFAULT_GAME_ACHIEVEMENTS.
- app/badges/page.jsx has a safe fallback page if your project was missing it.

No new SQL is required for this build fix.
