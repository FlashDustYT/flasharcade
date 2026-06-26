# V38 Important Notes

## Games still not fully playable

V37/V38 creates stable `/play/...` routes so the site no longer 404s, but the actual game builds need to exist in the repo.

Expected locations:

- public/games/how-many-rings/index.html
- public/games/legacy-league/index.html

If those folders/files are missing, the page shows a launcher/demo shell instead of the real game.

## Stripe payment errors

If the buttons say Pay $1.99 / $4.99 / $9.99 but Stripe errors after clicking, that usually means the Payment Link itself is incomplete, inactive, in test mode mismatch, or restricted in Stripe.

Check in Stripe:
1. Payment Link is active.
2. Product price exists.
3. Link is not archived.
4. If using test mode, test card is used.
5. If using live mode, account onboarding/verification must be complete.

## Owner/Admin

Owner is hardcoded to:
isaac.akinola122@gmail.com

Additional admins must be added to Vercel env:
NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com

A real database admin-permissions table is recommended next for true role permissions.
