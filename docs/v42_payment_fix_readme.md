# V42 Payment Fix Notes

The screenshot showed this URL:

flashportal.dev/Your%20Stripe%20Payment%20Link%20for%20the%20$1.99%20upload

That means Vercel still has placeholder text inside NEXT_PUBLIC_STRIPE_EXTRA_UPLOAD_URL.

Correct value must look like:
https://buy.stripe.com/...

V42 prevents placeholder text from opening as a local FlashPortal route and shows an alert instead.

Steps:
1. In Stripe Payment Links, open each link and copy the customer-facing link.
2. In Vercel Environment Variables, replace placeholder text with the real Stripe URL.
3. Save.
4. Redeploy V42.
