import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="checkout-page">
      <section className="checkout-card">
        <span className="pill">Checkout Cancelled</span>
        <h1>No worries.</h1>
        <p>The payment was cancelled and you were not charged.</p>
        <Link href="/" className="checkout-back-link">Back to FlashArcade</Link>
      </section>
    </main>
  );
}
