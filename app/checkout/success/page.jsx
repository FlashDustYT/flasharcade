import Link from "next/link";
import { CheckCircle, Upload, ShieldCheck } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <main className="checkout-page">
      <section className="checkout-card success">
        <CheckCircle size={58} />
        <span className="pill">Payment Complete</span>
        <h1>You're good to go.</h1>
        <p>Your FlashArcade payment went through. Return to the arcade and add your game details for review.</p>
        <div className="checkout-actions">
          <Link href="/?paid=game_upload#library" className="button primary"><Upload size={19} /> Add Game</Link>
          <Link href="/" className="button secondary"><ShieldCheck size={19} /> Back to FlashArcade</Link>
        </div>
      </section>
    </main>
  );
}
