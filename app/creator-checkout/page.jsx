"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CreditCard, Info, Rocket, Star, Upload, Zap, Lock } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const EXTRA_UPLOAD_FALLBACK_URL = "https://buy.stripe.com/00weVfeaz81Kaz190ic3m00";

const plans = [
  {
    title: "3 Free Game Uploads",
    price: "$0",
    eyebrow: "Starter",
    description: "Submit up to 3 browser games for manual FlashPortal review.",
    longDescription:
      "Best for testing the platform. You can upload up to 3 game ZIPs, add custom titles, descriptions, categories, and thumbnails, then wait for owner approval before they appear publicly.",
    cta: "Upload Free Games",
    href: "/creator/upload",
    env: null,
    icon: Upload,
    perks: ["Manual review", "Custom thumbnail", "Creator profile support", "Public listing after approval"],
  },
  {
    title: "Extra Game Upload",
    price: "$1.99",
    eyebrow: "More games",
    description: "Submit another browser game to FlashPortal for review.",
    longDescription:
      "Use this when you already used your 3 free uploads and want to submit another game. Payment covers the extra submission slot; every game still goes through review before publishing.",
    cta: "Pay $1.99",
    href: process.env.NEXT_PUBLIC_STRIPE_EXTRA_UPLOAD_URL || EXTRA_UPLOAD_FALLBACK_URL,
    env: "NEXT_PUBLIC_STRIPE_EXTRA_UPLOAD_URL",
    icon: Zap,
    perks: ["Additional submission", "Manual review", "Thumbnail support", "Creator listing"],
  },
  {
    title: "Featured 7 Days",
    price: "$4.99",
    eyebrow: "Boost",
    description: "Request featured placement for one approved game for 7 days.",
    longDescription:
      "Great for launches or small promo pushes. This is for approved games only and puts one selected game in a more visible featured area for one week.",
    cta: "Pay $4.99",
    href: process.env.NEXT_PUBLIC_STRIPE_FEATURED_7_URL,
    env: "NEXT_PUBLIC_STRIPE_FEATURED_7_URL",
    icon: Star,
    perks: ["7-day feature request", "Homepage visibility", "Approved games only", "Promo support"],
  },
  {
    title: "Featured 30 Days",
    price: "$9.99",
    eyebrow: "Maximum visibility",
    description: "Request longer featured placement for one approved game.",
    longDescription:
      "Best for creators who want a longer promo window. This keeps one approved game in featured placement for 30 days, subject to final owner approval.",
    cta: "Pay $9.99",
    href: process.env.NEXT_PUBLIC_STRIPE_FEATURED_30_URL,
    env: "NEXT_PUBLIC_STRIPE_FEATURED_30_URL",
    icon: Rocket,
    perks: ["30-day feature request", "Longer visibility", "Approved games only", "Best promo value"],
  },
];

function isValidStripePaymentUrl(url) {
  return typeof url === "string" && /^https:\/\/(buy|pay)\.stripe\.com\//i.test(url.trim());
}

export default function CreatorCheckout() {
  const [openInfo, setOpenInfo] = useState("3 Free Game Uploads");
  const [user, setUser] = useState(null);
  const [freeUploadLocked, setFreeUploadLocked] = useState(false);
  const [freeUploadCount, setFreeUploadCount] = useState(0);
  const [freeUploadStatus, setFreeUploadStatus] = useState("Checking free upload status...");

  useEffect(() => {
    async function checkFreeUpload() {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData?.session?.user || null;
      setUser(currentUser);

      if (!currentUser) {
        setFreeUploadStatus("Log in to use your 3 free game submissions.");
        setFreeUploadLocked(false);
        return;
      }

      const { data, error } = await supabase
        .from("game_submissions")
        .select("id,status")
        .or(`creator_id.eq.${currentUser.id},creator_email.eq.${currentUser.email}`)
        .in("status", ["pending", "approved"]);

      if (error) {
        setFreeUploadStatus("Free upload status could not be checked yet. Run the V44 Supabase SQL if needed.");
        setFreeUploadLocked(false);
        return;
      }

      const count = Array.isArray(data) ? data.length : 0;
      const used = count >= 3;
      setFreeUploadCount(count);
      setFreeUploadLocked(used);
      setFreeUploadStatus(
        used
          ? "Your 3 free upload slots are used or pending. Extra uploads use the $1.99 option."
          : `Free uploads used: ${count}/3. You still have ${3 - count} free upload${3 - count === 1 ? "" : "s"}.`
      );
    }

    checkFreeUpload();
  }, []);

  function openPayment(plan) {
    // Extra Upload safety check: the $1.99 card must never accidentally use the $9.99 featured link.
    let cleanUrl = typeof plan.href === "string" ? plan.href.trim() : "";
    if (plan.env === "NEXT_PUBLIC_STRIPE_EXTRA_UPLOAD_URL") {
      const featured30 = (process.env.NEXT_PUBLIC_STRIPE_FEATURED_30_URL || "").trim();
      if (!cleanUrl || cleanUrl === featured30 || cleanUrl.includes("cNi14p7Mb")) {
        cleanUrl = EXTRA_UPLOAD_FALLBACK_URL;
      }
    }

    if (!isValidStripePaymentUrl(cleanUrl)) {
      alert(`${plan.title} is not connected yet. In Vercel, edit ${plan.env} and paste the real Stripe Payment Link that starts with https://buy.stripe.com/ or https://pay.stripe.com/. Then redeploy.`);
      return;
    }

    if (plan.env === "NEXT_PUBLIC_STRIPE_EXTRA_UPLOAD_URL") {
      localStorage.setItem("flashportal-pending-paid-plan", "extra-upload");
    }
    window.location.assign(cleanUrl);
  }

  return (
    <main className="checkout-page upgraded-checkout-page v46-checkout-page">
      <Link className="back-link" href="/">
        <ArrowLeft size={18} /> Back to FlashPortal
      </Link>

      <section className="checkout-hero upgraded-checkout-hero">
        <span><CreditCard size={16} /> Creator Pricing</span>
        <h1>Publish on FlashPortal</h1>
        <p>
          Start with 3 free uploads, then only pay when you want extra uploads or featured placement.
          Every game is reviewed before it appears publicly.
        </p>
      </section>

      <section className="pricing-grid upgraded-pricing-grid v46-pricing-grid">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const expanded = openInfo === plan.title;

          return (
            <article className={`pricing-card upgraded-pricing-card v46-pricing-card ${expanded ? "is-expanded" : ""}`} key={plan.title}>
              <div className="pricing-card-top">
                <span className="plan-eyebrow">{plan.eyebrow}</span>
                <Icon size={24} />
              </div>

              <strong>{plan.price}</strong>
              <h2>{plan.title}</h2>
              <p>{plan.description}</p>

              <button
                type="button"
                className="info-toggle"
                onMouseEnter={() => setOpenInfo(plan.title)}
                onClick={() => setOpenInfo(expanded ? "" : plan.title)}
              >
                <Info size={16} /> {expanded ? "Hide details" : "More info"}
              </button>

              {expanded && (
                <div className="plan-info-panel">
                  <p>{plan.longDescription}</p>
                </div>
              )}

              <ul>
                {plan.perks.map((perk) => (
                  <li key={perk}><CheckCircle2 size={15} /> {perk}</li>
                ))}
              </ul>

              {plan.href === "/creator/upload" ? (
                <Link className="pricing-action" href={plan.href}>{plan.cta}</Link>
              ) : (
                <button className="pricing-action" type="button" onClick={() => openPayment(plan)}>
                  {plan.cta}
                </button>
              )}
            </article>
          );
        })}
      </section>

      <section className="checkout-note upgraded-checkout-note">
        <CreditCard size={24} />
        <div>
          <h3>How it works</h3>
          <p>
            Payments unlock the request/submission path. Games and featured placements still go through manual review so FlashPortal stays clean and creator-friendly.
          </p>
        </div>
      </section>
    </main>
  );
}
