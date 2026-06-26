import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRODUCTS = {
  game_upload: {
    name: "FlashArcade Game Submission",
    description: "Submit one browser game to FlashArcade for review.",
    amount: 199,
  },
  featured_7: {
    name: "FlashArcade Featured Game - 7 Days",
    description: "Request featured placement for one game for 7 days.",
    amount: 499,
  },
  featured_30: {
    name: "FlashArcade Featured Game - 30 Days",
    description: "Request featured placement for one game for 30 days.",
    amount: 999,
  },
};

export async function POST(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY environment variable." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const productKey = body?.productKey || "game_upload";
    const product = PRODUCTS[productKey];

    if (!product) {
      return NextResponse.json({ error: "Invalid product." }, { status: 400 });
    }

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://arcade.flashdust.dev";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${origin}/checkout/success?product=${productKey}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel?product=${productKey}`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: product.amount,
            product_data: {
              name: product.name,
              description: product.description,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        productKey,
        platform: "FlashArcade",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Stripe checkout failed." },
      { status: 500 }
    );
  }
}
