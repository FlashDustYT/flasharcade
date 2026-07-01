"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Search, Send, Trash2, UserRound, Users } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { getCreatorFeed, deleteSocialComment } from "../../lib/social";
import SocialReactionBar from "../../components/SocialReactionBar";

function isOnline(profile) {
  return profile?.last_seen_at && Date.now() - new Date(profile.last_seen_at).getTime() < 1000 * 60 * 5;
}

export default function CreatorHubPage() {
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [openPostId, setOpenPostId] = useState(null);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentText, setCommentText] = useState("");

  function loadCachedHub() {
    try {
      const raw = window.sessionStorage.getItem("flashportal-feed-cache-v79");
      if (!raw) return;
      const cached = JSON.parse(raw);
      if (Array.isArray(cached.posts)) setPosts(cached.posts);
      if (Array.isArray(cached.profiles)) setProfiles(cached.profiles);
    } catch {}
  }

  function saveCachedHub(nextPosts, nextProfiles) {
    try {
      window.sessionStorage.setItem("flashportal-feed-cache-v79", JSON.stringify({ posts: nextPosts || [], profiles: nextProfiles || [], at: Date.now() }));
    } catch {}
  }

  async function loadHub() {
    if (!posts.length && !profiles.length) loadCachedHub();
    setLoading(true);
    setStatus("");
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user || null;
    setUser(currentUser);

    if (currentUser) {
      try { await supabase.from("user_profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", currentUser.id); } catch {}
    }

    const [feedResult, profileResult, followResult] = await Promise.allSettled([
      getCreatorFeed(supabase, 50),
      supabase.from("user_profiles").select("*").eq("is_deleted", false).order("followers", { ascending: false }).limit(100),
      currentUser ? supabase.from("profile_follows").select("following_id").eq("follower_id", currentUser.id) : Promise.resolve({ data: [] }),
    ]);

    if (feedResult.status === "fulfilled") {
      const nextFeed = feedResult.value || [];
      setPosts(nextFeed);
      if (nextFeed.length) loadComments(nextFeed.slice(0, 10).map((post) => post.id));
    } else setStatus(`Creator Hub needs V81 SQL: ${feedResult.reason?.message || "feed failed"}`);

    if (profileResult.status === "fulfilled") setProfiles(profileResult.value?.data || []);
    if (followResult.status === "fulfilled") setFollowingIds((followResult.value?.data || []).map((item) => item.following_id));
    const nextPosts = feedResult.status === "fulfilled" ? (feedResult.value || []) : posts;
    const nextProfiles = profileResult.status === "fulfilled" ? (profileResult.value?.data || []) : profiles;
    saveCachedHub(nextPosts, nextProfiles);
    setLoading(false);
  }

  useEffect(() => { loadHub(); }, []);

  const filteredProfiles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const ranked = [...profiles].sort((a, b) => Number(b.followers || 0) - Number(a.followers || 0));
    if (!needle) return ranked;
    return ranked.filter((profile) => [profile.display_name, profile.username, profile.bio, profile.email].filter(Boolean).some((value) => String(value).toLowerCase().includes(needle)));
  }, [profiles, query]);

  const visiblePosts = useMemo(() => posts.filter((post) => {
    if (!post.author_is_private) return true;
    if (!user) return false;
    if (post.user_id === user.id) return true;
    return followingIds.includes(post.user_id);
  }), [posts, user, followingIds]);

  async function toggleFollow(profile) {
    if (!user) return setStatus("Log in first to follow creators.");
    if (profile.id === user.id) return setStatus("That is your own profile.");
    const alreadyFollowing = followingIds.includes(profile.id);
    const { data, error } = await supabase.rpc(alreadyFollowing ? "unfollow_profile" : "follow_profile", { target_profile_id: profile.id });
    if (error) return setStatus(`Follow failed: ${error.message}.`);
    setFollowingIds((current) => alreadyFollowing ? current.filter((id) => id !== profile.id) : [...current, profile.id]);
    setProfiles((current) => current.map((item) => item.id === profile.id ? { ...item, followers: Number(data?.followers ?? item.followers ?? 0) } : item));
  }

  async function loadComments(postId) {
    const ids = Array.isArray(postId) ? postId.filter(Boolean) : [postId].filter(Boolean);
    if (!ids.length) return;

    // Manual two-step lookup avoids PostgREST schema-cache relationship failures.
    const { data, error } = await supabase
      .from("social_comments")
      .select("id, post_id, user_id, body, created_at, is_deleted")
      .in("post_id", ids)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });
    if (error) return setStatus(`Comments failed: ${error.message}`);

    const commenterIds = [...new Set((data || []).map((comment) => comment.user_id).filter(Boolean))];
    let profilesById = {};
    if (commenterIds.length) {
      const { data: profileRows } = await supabase
        .from("user_profiles")
        .select("id, display_name, username, avatar_url")
        .in("id", commenterIds);
      profilesById = Object.fromEntries((profileRows || []).map((row) => [row.id, row]));
    }

    const grouped = {};
    ids.forEach((id) => { grouped[id] = []; });
    (data || []).forEach((comment) => {
      grouped[comment.post_id] ||= [];
      grouped[comment.post_id].push({ ...comment, user_profiles: profilesById[comment.user_id] || null });
    });
    setCommentsByPost((current) => ({ ...current, ...grouped }));
  }

  async function openComments(postId) {
    const next = openPostId === postId ? null : postId;
    setOpenPostId(next);
    if (next && !commentsByPost[postId]) await loadComments(postId);
  }

  async function submitComment(post) {
    if (!user) return setStatus("Log in first to comment.");
    const body = commentText.trim();
    if (!body) return;
    const { error } = await supabase.from("social_comments").insert({ post_id: post.id, user_id: user.id, body });
    if (error) return setStatus(`Comment failed: ${error.message}`);
    setCommentText("");
    setPosts((current) => current.map((item) => item.id === post.id ? { ...item, comments: Number(item.comments || 0) + 1 } : item));
    await loadComments(post.id);
    await loadHub();
  }

  async function removeComment(post, comment) {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteSocialComment(supabase, Number(comment.id));
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, comments: Math.max(0, Number(item.comments || 0) - 1) } : item));
      await loadComments(post.id);
      await loadHub();
    } catch (error) {
      setStatus(`Delete failed: ${error.message}`);
    }
  }

  return (
    <main className="creator-hub-page social-home-page">
      <Link className="back-link" href="/"><ArrowLeft size={18} /> Back to FlashPortal</Link>
      <section className="creator-feed-hero">
        <span><Users size={16} /> Creator Hub</span>
        <h1>Community Feed</h1>
        <p>Latest creator/player posts, images, updates, and comments. Use Creators to browse and follow people.</p>
        <label className="hub-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search creators..." /></label>
        {status && <p className="hub-status">{status}</p>}
      </section>
      <section className="creator-hub-feed-layout">
        <section className="hub-feed-panel">
          <h2>Latest Posts</h2>
          {loading && !visiblePosts.length ? <article className="social-post-card empty"><h3>Loading posts...</h3><p>Getting the newest community posts.</p></article> : visiblePosts.length ? visiblePosts.map((post) => {
            const comments = commentsByPost[post.id] || [];
            const postOwner = user?.id === post.user_id;
            return <article className="social-post-card" key={post.id}>
              <div className="post-author-row">
                <div className="mini-avatar">{post.author_avatar_url ? <img src={post.author_avatar_url} alt="" /> : <UserRound size={20} />}<span className={`online-dot ${isOnline({last_seen_at: post.author_last_seen_at}) ? "online" : ""}`} /></div>
                <div><strong>{post.author_display_name || "FlashPortal Player"}</strong><span>@{post.author_username || "player"} • {new Date(post.created_at).toLocaleDateString()}</span></div>
              </div>
              {post.body && <p>{post.body}</p>}
              {post.image_url && <img className="post-image" src={post.image_url} alt="Post attachment" />}
              {post.video_url && <video className="post-video" src={post.video_url} controls playsInline preload="metadata" />}
              <div className="post-actions-row-v77">
                <SocialReactionBar postId={Number(post.id)} initialLikes={post.likes} initialDislikes={post.dislikes} initialReaction={post.my_reaction || null} currentUserId={user?.id} />
                <button type="button" className="reaction-pill" onClick={() => openComments(post.id)}><MessageCircle size={16} /> {openPostId === post.id ? "Hide" : "Show"} {Number(post.comments || comments.length || 0)} Comment</button>
              </div>
              {openPostId === post.id && <div className="comments-panel-v77">
                {comments.length ? comments.map((comment) => {
                  const canDelete = user?.id === comment.user_id || postOwner;
                  return <div className="comment-card-v77" key={comment.id}>
                    <strong>{comment.user_profiles?.display_name || comment.user_profiles?.username || "Player"}</strong>
                    <p>{comment.body}</p>
                    {canDelete && <button type="button" className="tiny-danger-button" onClick={() => removeComment(post, comment)}><Trash2 size={13} /> Delete</button>}
                  </div>;
                }) : <p className="empty-comments-note">No comments yet.</p>}
                <div className="comment-input-row-v77"><input value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Write a comment..." /><button type="button" onClick={() => submitComment(post)}><Send size={16} /> Send</button></div>
              </div>}
            </article>;
          }) : <article className="social-post-card empty"><h3>No posts yet</h3><p>Go to your profile page and post an update.</p><Link href="/profile">Open Profile</Link></article>}
        </section>
        <aside className="creator-list-panel">
          <h2>Creators</h2><p className="editor-help">Quick creator list. Full directory is on the Creators page.</p><Link className="profile-edit-button mini" href="/creators">Open Creators</Link>
          {loading && !filteredProfiles.length ? <p>Loading creators...</p> : filteredProfiles.length ? filteredProfiles.slice(0, 8).map((profile) => {
            const isFollowing = followingIds.includes(profile.id); const isSelf = user?.id === profile.id; const canSeePrivate = !profile.is_private || isFollowing || isSelf;
            return <article className="creator-mini-card" key={profile.id}><div className="mini-avatar">{profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : <UserRound size={22} />}</div><div><strong>{profile.display_name || "FlashPortal Creator"}</strong><span>@{profile.username || "creator"}</span><p>{canSeePrivate ? profile.bio || "No bio yet." : "Private profile"}</p><div className="creator-mini-stats"><Link href={`/profile/${profile.username || profile.id}/followers`}>{Number(profile.followers || 0)} followers</Link><small>{profile.is_private ? "Private" : "Public"}</small></div><div className="creator-mini-actions"><Link href={`/profile/${profile.username || profile.id}`}>View Profile</Link>{!isSelf && <button type="button" onClick={() => toggleFollow(profile)}>{isFollowing ? "Following" : "Follow"}</button>}</div></div></article>;
          }) : <p>No creators found yet.</p>}
        </aside>
      </section>
    </main>
  );
}
