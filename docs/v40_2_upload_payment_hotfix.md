# V40.2 Upload + Payment Hotfix

## Upload error

If you saw:

Could not find the 'game_title' column of 'game_submissions' in the schema cache

Run:

supabase/v40_2_schema_cache_hotfix.sql

Then wait 10-30 seconds and try submitting again.

## Payment buttons

The app now sends users to Stripe in the same tab instead of opening a popup.

If Stripe still shows an error after clicking Pay:
- the Payment Link itself is invalid/inactive/archived, OR
- the link is test mode but your account/session expects live mode, OR
- Stripe onboarding/verification is incomplete.

Open each Payment Link directly in your browser. If it errors there too, fix it in Stripe.
