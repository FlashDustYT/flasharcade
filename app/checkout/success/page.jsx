"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  const [message, setMessage] = useState("Your FlashPortal payment went through.");

  useEffect(() => {
    const pending = localStorage.getItem("flashportal-pending-paid-plan");
    if (pending === "extra-upload") {
      const current = Number(localStorage.getItem("flashportal-paid-upload-slots") || "0");
      localStorage.setItem("flashportal-paid-upload-slots", String(current + 1));
      localStorage.removeItem("flashportal-pending-paid-plan");
      setMessage("Your extra upload slot is unlocked on this browser. You can submit one more game now.");
    }
  }, []);

  return (
    <main className="checkout-page">
      <section className="checkout-card success">
        <span className="pill">Payment Complete</span>
        <h1>You're good to go.</h1>
        <p>{message}</p>
        <Link href="/creator/upload" className="checkout-back-link">Upload Game</Link>
        <Link href="/" className="checkout-back-link">Back to FlashPortal</Link>
      </section>
    </main>
  );
}
