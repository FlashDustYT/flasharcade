"use client";

import { useMemo, useState } from "react";
import { addSocialComment, deleteSocialComment, setSocialReaction, SocialReaction } from "@/lib/social";
import { supabase } from "@/lib/supabase";

type Profile = {
  id?: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
};

type Comment = {
  id: number;
  post_id: number;
  user_id: string;
  body: string;
  created_at: string;
  profile?: Profile;
};

type SocialPost = {
  id: number;
  user_id: string;
  body: string;
  image_url?: string | null;
  video_url?: string | null;
  media_type?: string | null;
  created_at: string;
  likes?: number;
  dislikes?: number;
  comments?: number;
  my_reaction?: SocialReaction;
  profile?: Profile;
  commentsList?: Comment[];
};

export default function SocialPostCard({
  post,
  currentUserId,
  currentProfile,
}: {
  post: SocialPost;
  currentUserId?: string | null;
  currentProfile?: Profile | null;
}) {
  const [likes, setLikes] = useState(post.likes ?? 0);
  const [dislikes, setDislikes] = useState(post.dislikes ?? 0);
  const [myReaction, setMyReaction] = useState<SocialReaction>(post.my_reaction ?? null);
  const [comments, setComments] = useState<Comment[]>(post.commentsList ?? []);
  const [commentCount, setCommentCount] = useState(post.comments ?? post.commentsList?.length ?? 0);
  const [commentText, setCommentText] = useState("");
  const [commentOpen, setCommentOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const authorName = useMemo(() => {
    return post.profile?.display_name || post.profile?.username || "Player";
  }, [post.profile]);

  async function handleReaction(next: "like" | "dislike") {
    if (!currentUserId) {
      alert("Log in first.");
      return;
    }

    const oldLikes = likes;
    const oldDislikes = dislikes;
    const oldReaction = myReaction;

    const nextReaction: SocialReaction = oldReaction === next ? null : next;

    setMyReaction(nextReaction);
    setLikes((value) => {
      let n = value;
      if (oldReaction === "like") n -= 1;
      if (nextReaction === "like") n += 1;
      return Math.max(0, n);
    });
    setDislikes((value) => {
      let n = value;
      if (oldReaction === "dislike") n -= 1;
      if (nextReaction === "dislike") n += 1;
      return Math.max(0, n);
    });

    try {
      const result = await setSocialReaction(supabase, Number(post.id), next);
      setLikes(Number(result?.likes ?? 0));
      setDislikes(Number(result?.dislikes ?? 0));
      setMyReaction((result?.my_reaction ?? null) as SocialReaction);
    } catch (error) {
      setLikes(oldLikes);
      setDislikes(oldDislikes);
      setMyReaction(oldReaction);
      console.error(error);
      alert("Could not update reaction.");
    }
  }

  async function submitComment() {
    if (!currentUserId) {
      alert("Log in first.");
      return;
    }

    const clean = commentText.trim();
    if (!clean || busy) return;

    setBusy(true);
    try {
      const saved = await addSocialComment(supabase, Number(post.id), clean);
      const nextComment: Comment = {
        ...saved,
        profile: currentProfile ?? undefined,
      };

      setComments((list) => [...list, nextComment]);
      setCommentCount((count) => count + 1);
      setCommentText("");
      setCommentOpen(true);
    } catch (error) {
      console.error(error);
      alert("Could not post comment.");
    } finally {
      setBusy(false);
    }
  }

  async function removeComment(comment: Comment) {
    const canDelete = currentUserId === comment.user_id || currentUserId === post.user_id;
    if (!canDelete) return;

    const oldComments = comments;
    const oldCount = commentCount;

    setComments((list) => list.filter((item) => item.id !== comment.id));
    setCommentCount((count) => Math.max(0, count - 1));

    try {
      const newCount = await deleteSocialComment(supabase, Number(comment.id));
      setCommentCount(newCount);
    } catch (error) {
      setComments(oldComments);
      setCommentCount(oldCount);
      console.error(error);
      alert("Could not delete comment.");
    }
  }

  return (
    <article className="portal-card social-post-card">
      <header className="post-head">
        <img className="avatar avatar-sm" src={post.profile?.avatar_url || "/default-avatar.png"} alt="" />
        <div>
          <strong>{authorName}</strong>
          <p className="muted">@{post.profile?.username || "player"} • {new Date(post.created_at).toLocaleDateString()}</p>
        </div>
      </header>

      {post.body ? <p className="post-body">{post.body}</p> : null}

      {post.media_type === "video" && post.video_url ? (
        <video className="post-media" src={post.video_url} controls playsInline />
      ) : post.image_url ? (
        <img className="post-media" src={post.image_url} alt="" />
      ) : null}

      <div className="post-actions">
        <button className={`pill ${myReaction === "like" ? "active" : ""}`} onClick={() => handleReaction("like")}>
          {myReaction === "like" ? "♥" : "♡"} {likes}
        </button>

        <button className={`pill ${myReaction === "dislike" ? "active" : ""}`} onClick={() => handleReaction("dislike")}>
          👎 {dislikes}
        </button>

        <button className="pill" onClick={() => setCommentOpen((value) => !value)}>
          💬 {commentCount} Comment{commentCount === 1 ? "" : "s"}
        </button>
      </div>

      {commentOpen ? (
        <section className="comment-box">
          {comments.map((comment) => {
            const canDelete = currentUserId === comment.user_id || currentUserId === post.user_id;
            return (
              <div className="comment-row" key={comment.id}>
                <div>
                  <strong>{comment.profile?.display_name || comment.profile?.username || "Player"}</strong>
                  <p>{comment.body}</p>
                </div>
                {canDelete ? (
                  <button className="mini-danger" onClick={() => removeComment(comment)}>
                    Delete
                  </button>
                ) : null}
              </div>
            );
          })}

          <div className="comment-form">
            <input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Write a comment..."
              onKeyDown={(event) => {
                if (event.key === "Enter") submitComment();
              }}
            />
            <button onClick={submitComment} disabled={busy}>
              Send
            </button>
          </div>
        </section>
      ) : null}
    </article>
  );
}
