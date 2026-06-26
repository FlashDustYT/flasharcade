"use client";

import Link from "next/link";
import { useState } from "react";

const PRODUCTS = [
  {
    key: "free_first_upload",
    title: "First Game Free",
    price: "$0",
    text: "Your first FlashPortal game submission is free. No Stripe checkout needed.",
    free: true,
  },
  {
    key: "game_upload",
    title: "Extra Game Upload",
    price: "$1.99",
    text: "Submit another browser game to FlashPortal for review.",
  },
  {
    key: "featured_7",
    title: "Featured 7 Days",
    price: "$4.99",
    text: "Request featured placement for one game for 7 days.",
  },
  {
    key: "featured_30",
    title: "Featured 30 Days",
    price: "$9.99",
    text: "Request featured placement for one game for 30 days.",
  },
];

export default function CreatorCheckoutPage() {
  const [loading, setLoading] = useState("");

  async function startCheckout(productKey) {
    const product = PRODUCTS.find((item) => item.key === productKey);

    if (product?.free) {
      window.location.href = "/creator/upload";
      return;
    }

    try {
      setLoading(productKey);

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Checkout failed.");
      }

      window.location.href = data.url;
    } catch (error) {
      alert(error.message || "Could not start checkout.");
      setLoading("");
    }
  }

  return (
    <main className="checkout-page">
      <section className="checkout-card">
        <span className="pill">Creator Studio</span>
        <h1>Publish on FlashPortal</h1>
        <p>
          New creators get their first game submission free. Paid options are for extra uploads
          and featured placement once creators want more promotion.
        </p>

        <div className="checkout-product-grid">
          {PRODUCTS.map((product) => (
            <button
              key={product.key}
              type="button"
              onClick={() => startCheckout(product.key)}
              disabled={Boolean(loading)}
            >
              <strong>{product.price}</strong>
              <span>{product.title}</span>
              <small>{loading === product.key ? "Loading checkout..." : product.text}</small>
            </button>
          ))}
        </div>

        <Link href="/" className="checkout-back-link">
          Back to FlashPortal
        </Link>
      </section>
    </main>
  );
}
