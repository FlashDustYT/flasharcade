import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <main className="checkout-page">
      <section className="checkout-card">
        <CreditCard size={58} />
        <span className="pill">Checkout Cancelled</span>
        <h1>No worries.</h1>
        <p>
          The payment was cancelled and you were not charged. You can return to
          FlashArcade whenever you're ready.
        </p>

        <div className="checkout-actions">
          <Link href="/" className="button primary">
            <ArrowLeft size={19} /> Back to FlashArcade
          </Link>
        </div>
      </section>
    </main>
  );
}
