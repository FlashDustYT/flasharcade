"use client";

import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";

const plans = [
  {
    title: "First Game Free",
    price: "$0",
    description: "Your first FlashPortal game submission is free. No Stripe checkout needed.",
    cta: "Upload First Game",
    href: "/creator/upload",
    env: null,
  },
  {
    title: "Extra Game Upload",
    price: "$1.99",
    description: "Submit another browser game to FlashPortal for review.",
    cta: "Pay $1.99",
    href: process.env.NEXT_PUBLIC_STRIPE_EXTRA_UPLOAD_URL,
    env: "NEXT_PUBLIC_STRIPE_EXTRA_UPLOAD_URL",
  },
  {
    title: "Featured 7 Days",
    price: "$4.99",
    description: "Request featured placement for one approved game for 7 days.",
    cta: "Pay $4.99",
    href: process.env.NEXT_PUBLIC_STRIPE_FEATURED_7_URL,
    env: "NEXT_PUBLIC_STRIPE_FEATURED_7_URL",
  },
  {
    title: "Featured 30 Days",
    price: "$9.99",
    description: "Request longer featured placement for one approved game.",
    cta: "Pay $9.99",
    href: process.env.NEXT_PUBLIC_STRIPE_FEATURED_30_URL,
    env: "NEXT_PUBLIC_STRIPE_FEATURED_30_URL",
  },
];

function isValidStripePaymentUrl(url) {
  return typeof url === "string" && /^https:\/\/(buy|pay)\.stripe\.com\//i.test(url.trim());
}

export default function CreatorCheckout() {
  function openPayment(plan) {
    const cleanUrl = typeof plan.href === "string" ? plan.href.trim() : "";

    if (!isValidStripePaymentUrl(cleanUrl)) {
      alert(`${plan.title} is not connected yet. In Vercel, edit ${plan.env} and paste the real customer-facing Stripe Payment Link. It must start with https://buy.stripe.com/ or https://pay.stripe.com/. Then save and redeploy.`);
      return;
    }

    window.location.assign(cleanUrl);
  }

  return (
    <main className="checkout-page">
      <Link className="back-link" href="/">
        <ArrowLeft size={18} /> Back to FlashPortal
      </Link>

      <section className="checkout-hero">
        <span><CreditCard size={16} /> Creator Pricing</span>
        <h1>Publish on FlashPortal</h1>
        <p>
          Start free, then only pay when you want extra uploads or featured placement.
        </p>
      </section>

      <section className="pricing-grid">
        {plans.map((plan) => (
          <article className="pricing-card" key={plan.title}>
            <strong>{plan.price}</strong>
            <h2>{plan.title}</h2>
            <p>{plan.description}</p>
            <ul>
              <li>Manual review before publishing</li>
              <li>Creator profile support</li>
              <li>Game thumbnail support</li>
            </ul>

            {plan.href === "/creator/upload" ? (
              <Link href={plan.href}>{plan.cta}</Link>
            ) : (
              <button type="button" onClick={() => openPayment(plan)}>
                {plan.cta}
              </button>
            )}
          </article>
        ))}
      </section>

      <section className="checkout-note">
        <CreditCard size={24} />
        <div>
          <h3>Payment setup check</h3>
          <p>
            Payment buttons only work after each Vercel environment variable contains the real Stripe customer URL, not placeholder text.
          </p>
        </div>
      </section>
    </main>
  );
}
