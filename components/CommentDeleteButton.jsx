"use client";

import { useState } from "react";
import { deleteSocialComment } from "../lib/social";
import { supabase } from "../lib/supabaseClient";

export default function CommentDeleteButton({ commentId, onDeleted }) {
  const [busy, setBusy] = useState(false);

  async function removeComment() {
    if (busy) return;
    if (!confirm("Delete this comment?")) return;
    setBusy(true);
    try {
      await deleteSocialComment(supabase, Number(commentId));
      onDeleted?.();
    } catch (error) {
      console.error(error);
      alert("Could not delete comment.");
    } finally {
      setBusy(false);
    }
  }

  return <button type="button" className="tiny-danger-button" onClick={removeComment}>Delete</button>;
}
