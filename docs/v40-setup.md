# FlashPortal V40 Setup

## Required Supabase SQL

Run:

supabase/v40_platform_backend.sql

This creates:
- persistent play counts
- increment_game_play RPC
- admin_roles
- fixed game_submissions policies
- owner/admin read/update access for submissions

## Why your second account randomly had admin

Previous versions allowed extra admin access from a public env variable. V40 removes that behavior from the frontend. Only:
- isaac.akinola122@gmail.com
- emails saved in Supabase admin_roles

can see Owner/Admin tools.

## Why submissions did not appear

The upload form may have inserted the submission, but RLS blocked the owner from reading all submissions. V40 SQL fixes this.

## Why Stripe may still error

If the button says Pay but Stripe errors, the app is reaching Stripe. That means the Payment Link itself needs checking:
- Make sure it is active
- Make sure it is not archived
- Make sure Stripe account verification is complete
- If test mode, use test card
- If live mode, use live payment link, not test link
