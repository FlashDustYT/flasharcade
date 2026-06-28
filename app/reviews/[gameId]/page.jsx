"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Star } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

const gameNames = {
  "how-many-rings": "How Many Rings?",
  "legacy-league": "Legacy League",
  "guess-the-word": "Guess the Word!",
  "guess-the-celeb": "Guess the Celeb",
};

export default function ReviewsPage({ params }) {
  const gameId = params.gameId;
  const gameTitle = gameNames[gameId] || gameId.replaceAll("-", " ");
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState("");

  async function loadReviews() {
    const { data, error } = await supabase
      .from("game_reviews")
      .select("*")
      .eq("game_id", gameId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(data);
      return;
    }

    const all = JSON.parse(localStorage.getItem("flashportal-public-reviews") || "{}");
    setReviews(all[gameId] || []);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data?.session?.user || null));
    loadReviews();
  }, [gameId]);

  async function submitReview(event) {
    event.preventDefault();
    const cleanText = reviewText.trim();
    if (!cleanText) {
      setStatus("Write a review first.");
      return;
    }

    const payload = {
      game_id: gameId,
      user_id: user?.id || null,
      user_email: user?.email || "",
      display_name: displayName.trim() || user?.email || "Anonymous Player",
      rating: Number(rating),
      review: cleanText,
    };

    const { error } = await supabase.from("game_reviews").insert(payload);

    if (error) {
      const all = JSON.parse(localStorage.getItem("flashportal-public-reviews") || "{}");
      const fallbackReview = { ...payload, id: Date.now(), created_at: new Date().toISOString() };
      all[gameId] = [fallbackReview, ...(all[gameId] || [])];
      localStorage.setItem("flashportal-public-reviews", JSON.stringify(all));
      setReviews(all[gameId]);
      setStatus("Review saved locally. Run V46 SQL to save reviews publicly.");
    } else {
      setStatus("Review posted.");
      await loadReviews();
    }

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
        <span><MessageSquare size={16} /> Public Reviews</span>
        <h1>{gameTitle}</h1>
        <p>{reviews.length ? `${reviews.length} review${reviews.length === 1 ? "" : "s"} • ${averageRating} average rating` : "No reviews yet. Be the first one."}</p>
      </section>

      <form className="review-form" onSubmit={submitReview}>
        <h2>Write a Review</h2>
        <label>
          Display name
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder={user?.email || "Anonymous Player"} />
        </label>
        <label>
          Rating
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
          <textarea value={reviewText} onChange={(event) => setReviewText(event.target.value)} placeholder="Tell players what you thought..." />
        </label>
        <button type="submit"><Star size={16} /> Post Review</button>
        {status && <p className="form-status">{status}</p>}
      </form>

      <section className="review-list">
        <h2>Reviews</h2>
        {reviews.length ? reviews.map((review) => (
          <article className="public-review-card" key={review.id || `${review.created_at}-${review.review}`}>
            <strong>{review.rating}★</strong>
            <p>{review.review}</p>
            <span>{review.display_name || review.user_email || "Anonymous Player"} • {new Date(review.created_at).toLocaleDateString()}</span>
          </article>
        )) : (
          <article className="public-review-card"><p>No reviews yet.</p></article>
        )}
      </section>
    </main>
  );
}
