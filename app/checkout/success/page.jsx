import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="checkout-page">
      <section className="checkout-card success">
        <span className="pill">Payment Complete</span>
        <h1>You're good to go.</h1>
        <p>Your FlashPortal payment went through.</p>
        <Link href="/" className="checkout-back-link">Back to FlashPortal</Link>
      </section>
    </main>
  );
}
