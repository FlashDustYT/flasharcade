"use client";

import { useState } from "react";
import { setSocialReaction } from "../lib/social";
import { supabase } from "../lib/supabaseClient";

export default function SocialReactionBar({ postId, initialLikes = 0, initialDislikes = 0, initialReaction = null, currentUserId = null }) {
  const [likes, setLikes] = useState(Number(initialLikes || 0));
  const [dislikes, setDislikes] = useState(Number(initialDislikes || 0));
  const [myReaction, setMyReaction] = useState(initialReaction || null);
  const [busy, setBusy] = useState(false);

  async function react(next) {
    if (!currentUserId) return alert("Log in first.");
    if (busy) return;

    const old = { likes, dislikes, myReaction };
    const nextReaction = myReaction === next ? null : next;

    setBusy(true);
    setMyReaction(nextReaction);
    setLikes((value) => Math.max(0, value + (old.myReaction === "like" ? -1 : 0) + (nextReaction === "like" ? 1 : 0)));
    setDislikes((value) => Math.max(0, value + (old.myReaction === "dislike" ? -1 : 0) + (nextReaction === "dislike" ? 1 : 0)));

    try {
      const result = await setSocialReaction(supabase, Number(postId), next);
      setLikes(Number(result?.likes || 0));
      setDislikes(Number(result?.dislikes || 0));
      setMyReaction(result?.my_reaction || null);
    } catch (error) {
      setLikes(old.likes);
      setDislikes(old.dislikes);
      setMyReaction(old.myReaction);
      console.error(error);
      alert("Could not update reaction.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="post-actions reaction-actions">
      <button type="button" className={`reaction-pill ${myReaction === "like" ? "active liked" : ""}`} aria-pressed={myReaction === "like"} onClick={() => react("like")}>
        <span>{myReaction === "like" ? "♥" : "♡"}</span> <strong>{likes}</strong>
      </button>
      <button type="button" className={`reaction-pill ${myReaction === "dislike" ? "active disliked" : ""}`} aria-pressed={myReaction === "dislike"} onClick={() => react("dislike")}>
        <span>👎</span> <strong>{dislikes}</strong>
      </button>
    </div>
  );
}
