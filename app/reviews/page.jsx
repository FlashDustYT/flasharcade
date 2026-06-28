"use client";

import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";

const games = [
  { id: "how-many-rings", title: "How Many Rings?" },
  { id: "legacy-league", title: "Legacy League" },
  { id: "guess-the-celeb", title: "Guess the Celeb" },
  { id: "guess-the-word", title: "Guess the Word!" },
];

export default function ReviewsIndexPage() {
  return (
    <main className="reviews-page">
      <Link className="back-link" href="/">
        <ArrowLeft size={18} /> Back to FlashPortal
      </Link>

      <section className="reviews-hero">
        <span><Star size={16} /> FlashPortal Reviews</span>
        <h1>Review a Game</h1>
        <p>Choose a game to view or write reviews.</p>
      </section>

      <section className="review-list">
        {games.map((game) => (
          <article className="public-review-card" key={game.id}>
            <strong>{game.title}</strong>
            <p>View ratings and player reviews.</p>
            <Link className="review-action-button" href={`/reviews/${game.id}`}>Review / Rate</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
