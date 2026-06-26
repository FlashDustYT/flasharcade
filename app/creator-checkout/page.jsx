"use client";

import Link from "next/link";
import { ArrowLeft, Check, Sparkles, Upload } from "lucide-react";

const plans = [
  {
    price: "$0",
    title: "First Game Free",
    text: "Your first FlashPortal game submission is free. No Stripe checkout needed.",
    cta: "Upload First Game",
    href: "/creator/upload",
    featured: true,
  },
  {
    price: "$1.99",
    title: "Extra Game Upload",
    text: "Submit another browser game for FlashPortal review.",
    cta: "Pay $1.99",
    env: "NEXT_PUBLIC_STRIPE_EXTRA_UPLOAD_URL",
    href: process.env.NEXT_PUBLIC_STRIPE_EXTRA_UPLOAD_URL || "",
  },
  {
    price: "$4.99",
    title: "Featured 7 Days",
    text: "Request featured placement for one approved game for 7 days.",
    cta: "Pay $4.99",
    env: "NEXT_PUBLIC_STRIPE_FEATURED_7_URL",
    href: process.env.NEXT_PUBLIC_STRIPE_FEATURED_7_URL || "",
  },
  {
    price: "$9.99",
    title: "Featured 30 Days",
    text: "Request longer featured placement for one approved game.",
    cta: "Pay $9.99",
    env: "NEXT_PUBLIC_STRIPE_FEATURED_30_URL",
    href: process.env.NEXT_PUBLIC_STRIPE_FEATURED_30_URL || "",
  },
];

export default function CreatorCheckout() {
  function handleMissing(plan) {
    alert(`Stripe link missing for ${plan.title}. Add ${plan.env} in Vercel Environment Variables, then redeploy.`);
  }

  function openPayment(plan) {
    if (!plan.href?.startsWith("http")) {
      handleMissing(plan);
      return;
    }

    // Same-tab navigation avoids popup blockers and makes Stripe errors clearer.
    window.location.href = plan.href;
  }

  return (
    <main className="checkout-page">
      <Link className="back-link" href="/">
        <ArrowLeft size={18} /> Back to FlashPortal
      </Link>

      <section className="checkout-hero">
        <span><Sparkles size={16} /> Creator Studio</span>
        <h1>Publish on FlashPortal</h1>
        <p>
          Start free, then only pay when you want extra uploads or featured placement.
          Paid buttons connect through Stripe Payment Links.
        </p>
      </section>

      <section className="plan-grid">
        {plans.map((plan) => (
          <article className={`plan-card ${plan.featured ? "featured" : ""}`} key={plan.title}>
            <strong>{plan.price}</strong>
            <h2>{plan.title}</h2>
            <p>{plan.text}</p>
            <ul>
              <li><Check size={16} /> Manual review before publishing</li>
              <li><Check size={16} /> Creator profile support</li>
              <li><Check size={16} /> Game thumbnail support</li>
            </ul>

            {plan.href?.startsWith("http") ? (
              <button type="button" onClick={() => openPayment(plan)}>{plan.cta}</button>
            ) : plan.href ? (
              <Link href={plan.href}>{plan.cta}</Link>
            ) : (
              <button type="button" onClick={() => handleMissing(plan)}>
                Connect Stripe Link
              </button>
            )}
          </article>
        ))}
      </section>

      <section className="checkout-note">
        <Upload size={24} />
        <div>
          <h3>How uploads work</h3>
          <p>
            Creators submit a ZIP and thumbnail. Games go into a pending review queue before being
            shown publicly on FlashPortal.
          </p>
        </div>
      </section>
    </main>
  );
}
