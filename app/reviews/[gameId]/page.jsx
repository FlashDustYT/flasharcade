"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Star } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

const GAME_NAMES = {
  "how-many-rings": "How Many Rings?",
  "legacy-league": "Legacy League",
  "guess-the-word": "Guess the Word!",
  "guess-the-celeb": "Guess the Celeb",
  "guess-the-celebrity": "Guess the Celeb",
};

function getLocalReviews(gameId) {
  try {
    const allReviews = JSON.parse(localStorage.getItem("flashportal-reviews-v50") || "{}");
    return Array.isArray(allReviews[gameId]) ? allReviews[gameId] : [];
  } catch {
    return [];
  }
}

function saveLocalReview(gameId, review) {
  const allReviews = JSON.parse(localStorage.getItem("flashportal-reviews-v50") || "{}");
  const next = [review, ...(Array.isArray(allReviews[gameId]) ? allReviews[gameId] : [])];
  allReviews[gameId] = next;
  localStorage.setItem("flashportal-reviews-v50", JSON.stringify(allReviews));
  return next;
}

export default function ReviewsPage({ params }) {
  const gameId = params.gameId;
  const gameTitle = GAME_NAMES[gameId] || gameId.replaceAll("-", " ");
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [status, setStatus] = useState("Loading reviews...");

  async function loadReviews() {
    const { data, error } = await supabase
      .from("game_reviews")
      .select("id, game_id, user_email, display_name, rating, review, created_at")
      .eq("game_id", gameId)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      const local = getLocalReviews(gameId);
      const combined = [...data, ...local.filter((item) => !data.some((dbItem) => dbItem.id === item.id))];
      setReviews(combined);
      setStatus("");
      return;
    }

    setReviews(getLocalReviews(gameId));
    setStatus("Reviews are using local fallback. Run the V50 SQL to save reviews publicly.");
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data?.session?.user || null;
      setUser(currentUser);
      if (currentUser?.email) setDisplayName(currentUser.email.split("@")[0]);
    });

    loadReviews();
  }, [gameId]);

  const averageRating = useMemo(() => {
    const validRatings = reviews
      .map((item) => Number(item.rating))
      .filter((value) => Number.isFinite(value) && value >= 1 && value <= 5);

    if (!validRatings.length) return "New";
    return (validRatings.reduce((sum, value) => sum + value, 0) / validRatings.length).toFixed(1);
  }, [reviews]);

  async function submitReview(event) {
    event.preventDefault();

    const cleanReview = reviewText.trim();
    const cleanName = displayName.trim() || user?.email?.split("@")[0] || "Anonymous Player";
    const numericRating = Number(rating);

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      setStatus("Pick a star rating first.");
      return;
    }

    const payload = {
      game_id: gameId,
      user_id: user?.id || null,
      user_email: user?.email || "",
      display_name: cleanName,
      rating: numericRating,
      review: cleanReview || "",
    };

    const { data, error } = await supabase
      .from("game_reviews")
      .insert(payload)
      .select("id, game_id, user_email, display_name, rating, review, created_at")
      .single();

    if (!error && data) {
      setReviews((current) => [data, ...current]);
      setStatus("Rating posted. Homepage cards update after refresh.");
      if (typeof window !== "undefined") window.dispatchEvent(new Event("flashportal-reviews-changed"));
    } else {
      const fallbackReview = {
        ...payload,
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      const nextLocalReviews = saveLocalReview(gameId, fallbackReview);
      setReviews(nextLocalReviews);
      setStatus("Rating saved locally. Run review SQL so ratings save publicly in Supabase.");
      if (typeof window !== "undefined") window.dispatchEvent(new Event("flashportal-reviews-changed"));
    }

    setReviewText("");
    setRating(5);
    setHoverRating(0);
  }

  return (
    <main className="reviews-page">
      <Link className="back-link" href="/">
        <ArrowLeft size={18} /> Back to FlashPortal
      </Link>

      <section className="reviews-hero">
        <span><MessageSquare size={16} /> Reviews & Ratings</span>
        <h1>{gameTitle}</h1>
        <p>
          {reviews.length
            ? `${reviews.length} review${reviews.length === 1 ? "" : "s"} • ${averageRating}/5 average`
            : "No reviews yet. Be the first one."}
        </p>
      </section>

      <form className="review-form" onSubmit={submitReview}>
        <h2>Rate or Review</h2>

        <label>
          Display name
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Anonymous Player"
          />
        </label>

        <div className="star-rating-picker">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={star <= (hoverRating || rating) ? "active" : ""}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              aria-label={`${star} star rating`}
            >
              <Star size={30} fill="currentColor" />
            </button>
          ))}
          <strong>{rating}/5</strong>
        </div>

        <label>
          Review
          <textarea
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            placeholder="Optional: what did you think of the game?"
          />
        </label>

        <button type="submit">
          <Star size={16} /> Submit Rating
        </button>

        {status && <p className="form-status">{status}</p>}
      </form>

      <section className="review-list">
        <h2>Public Reviews</h2>

        {reviews.length ? (
          reviews.map((item) => (
            <article className="public-review-card" key={item.id || `${item.created_at}-${item.review}`}>
              <strong>{item.rating}★</strong>
              {item.review ? <p>{item.review}</p> : <p className="muted-review">No written review.</p>}
              <span>
                {item.display_name || item.user_email || "Anonymous Player"} •{" "}
                {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Just now"}
              </span>
            </article>
          ))
        ) : (
          <article className="public-review-card">
            <p>No reviews yet.</p>
          </article>
        )}
      </section>
    </main>
  );
}
