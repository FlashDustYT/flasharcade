# FlashPortal Domain + Stripe Setup

## Domain redirects

This version includes redirects in `next.config.js`:

- `arcade.flashdust.dev/*` → `https://flashportal.dev/*`
- `flasharcade.vercel.app/*` → `https://flashportal.dev/*`

After deploying, open the old URL in a fresh/incognito tab. It should redirect.

If it does not redirect immediately:
1. Make sure V35 is deployed successfully.
2. In Vercel → Settings → Domains, set `flashportal.dev` as the primary domain.
3. Wait a few minutes.
4. Clear browser cache or test in incognito.

## Stripe paid buttons

The free first upload does not need Stripe.

The paid buttons need Stripe Payment Links. Create 3 Stripe Payment Links:

1. Extra Game Upload — $1.99
2. Featured 7 Days — $4.99
3. Featured 30 Days — $9.99

Then add these Vercel Environment Variables:

NEXT_PUBLIC_STRIPE_EXTRA_UPLOAD_URL=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_FEATURED_7_URL=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_FEATURED_30_URL=https://buy.stripe.com/...

Then redeploy.

Until those environment variables are added, the buttons will say "Connect Stripe Link."
