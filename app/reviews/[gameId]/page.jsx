"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Star } from "lucide-react";

const gameNames = {
  "how-many-rings": "How Many Rings?",
  "legacy-league": "Legacy League",
  "guess-the-word": "Guess the Word!",
  "guess-the-celeb": "Guess the Celeb",
};

export default function ReviewsPage({ params }) {
  const gameId = params.gameId;
  const gameTitle = gameNames[gameId] || gameId.replaceAll("-", " ");
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem("flashportal-public-reviews") || "{}");
      setReviews(all[gameId] || []);
    } catch {
      setReviews([]);
    }
  }, [gameId]);

  function saveReviews(nextReviews) {
    const all = JSON.parse(localStorage.getItem("flashportal-public-reviews") || "{}");
    all[gameId] = nextReviews;
    localStorage.setItem("flashportal-public-reviews", JSON.stringify(all));
    setReviews(nextReviews);
  }

  function submitReview(event) {
    event.preventDefault();
    const text = reviewText.trim();
    if (!text) return;

    const next = [
      {
        rating: Number(rating),
        text,
        author: author.trim() || "Anonymous Player",
        createdAt: new Date().toISOString(),
      },
      ...reviews,
    ];

    saveReviews(next);
    setReviewText("");
  }

  const averageRating = useMemo(() => {
    if (!reviews.length) return "New";
    return (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <main className="reviews-page">
      <Link href="/" className="back-link"><ArrowLeft size={18} /> Back to FlashPortal</Link>

      <section className="reviews-hero">
        <span><MessageSquare size={16} /> Player Reviews</span>
        <h1>{gameTitle}</h1>
        <p>{reviews.length ? `${reviews.length} public review${reviews.length === 1 ? "" : "s"} • ${averageRating} average rating` : "No reviews yet. Be the first one."}</p>
      </section>

      <form className="review-form" onSubmit={submitReview}>
        <h2>Write a Review</h2>
        <label>
          Display name
          <input value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="Anonymous Player" />
        </label>
        <label>
          Star rating
          <select value={rating} onChange={(event) => setRating(event.target.value)}>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
        </label>
        <label>
          Review
          <textarea value={reviewText} onChange={(event) => setReviewText(event.target.value)} placeholder="What did you think of the game?" />
        </label>
        <button type="submit"><Star size={16} /> Post Review</button>
      </form>

      <section className="review-list">
        <h2>Public Reviews</h2>
        {reviews.length ? reviews.map((review, index) => (
          <article className="public-review-card" key={`${review.createdAt}-${index}`}>
            <strong>{review.rating}★</strong>
            <p>{review.text}</p>
            <span>{review.author} • {new Date(review.createdAt).toLocaleDateString()}</span>
          </article>
        )) : (
          <article className="public-review-card">
            <p>No reviews yet.</p>
          </article>
        )}
      </section>
    </main>
  );
}
