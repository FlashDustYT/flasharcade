"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, EyeOff, Gamepad2, Heart, MessageCircle, Send, Trash2, UserRound, X } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { getLastSeenLabel, isRecentlyOnline } from "../../../lib/presence";
import { awardEarlyBuildBadges, badgeInfo } from "../../../lib/badges";
import { deleteSocialComment } from "../../../lib/social";
import SocialReactionBar from "../../../components/SocialReactionBar";

function safeLookup(value) {
  return String(value || "").toLowerCase().replace(/^@+/, "").replace(/[^a-z0-9_.@-]/g, "");
}

export default function PublicProfilePage({ params }) {
  const lookup = params.username;
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [games, setGames] = useState([]);
  const [following, setFollowing] = useState(false);
  const [mutualFollow, setMutualFollow] = useState(false);
  const [status, setStatus] = useState("");
  const [badges, setBadges] = useState([]);
  const [badgesOpen, setBadgesOpen] = useState(false);
  const [openPostId, setOpenPostId] = useState(null);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentTextByPost, setCommentTextByPost] = useState({});

  async function loadComments(postIds) {
    const ids = Array.isArray(postIds) ? postIds.filter(Boolean) : [postIds].filter(Boolean);
    if (!ids.length) return;
    const { data, error } = await supabase
      .from("social_comments")
      .select("*, user_profiles(display_name, username, avatar_url)")
      .in("post_id", ids)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });
    if (error) {
      setStatus(`Comments failed: ${error.message}`);
      return;
    }
    const grouped = {};
    (data || []).forEach((comment) => {
      grouped[comment.post_id] ||= [];
      grouped[comment.post_id].push(comment);
    });
    setCommentsByPost((current) => ({ ...current, ...grouped }));
  }

  async function loadProfile() {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user || null;
    setUser(currentUser);

    const cleanedLookup = safeLookup(lookup);
    const { data: allProfiles, error } = await supabase.from("user_profiles").select("*").limit(500);
    const profileData = (allProfiles || []).find((item) =>
      String(item.id) === String(lookup) ||
      safeLookup(item.username) === cleanedLookup ||
      safeLookup(item.email?.split("@")[0]) === cleanedLookup ||
      safeLookup(item.display_name) === cleanedLookup
    );

    if (error || !profileData) {
      setStatus("Profile not found. That account may need to open /profile and hit Save Profile once.");
      return;
    }

    setProfile(profileData);

    let iFollowThem = false;
    let theyFollowMe = false;

    if (currentUser) {
      try { await awardEarlyBuildBadges(supabase, currentUser.id); } catch {}
      const { data: followRows } = await supabase
        .from("profile_follows")
        .select("follower_id, following_id")
        .or(`and(follower_id.eq.${currentUser.id},following_id.eq.${profileData.id}),and(follower_id.eq.${profileData.id},following_id.eq.${currentUser.id})`);
      iFollowThem = (followRows || []).some((row) => row.follower_id === currentUser.id && row.following_id === profileData.id);
      theyFollowMe = (followRows || []).some((row) => row.follower_id === profileData.id && row.following_id === currentUser.id);
      setFollowing(iFollowThem);
      setMutualFollow(iFollowThem && theyFollowMe);
    }

    const { data: badgeData } = await supabase
      .from("user_badges")
      .select("*")
      .eq("user_id", profileData.id)
      .order("earned_at", { ascending: false });
    const realBadges = badgeData || [];
    if (!realBadges.some((row) => row.badge_code === "flashportal_pioneer" || row.badge_code === "early_player")) {
      realBadges.unshift({ user_id: profileData.id, badge_code: "flashportal_pioneer", earned_at: profileData.created_at || new Date().toISOString() });
    }
    setBadges(realBadges);

    const canView = !profileData.is_private || currentUser?.id === profileData.id || iFollowThem;
    if (canView) {
      const { data: postData } = await supabase
        .from("social_posts")
        .select("*")
        .eq("user_id", profileData.id)
        .order("created_at", { ascending: false })
        .limit(50);
      const nextPosts = (postData || []).filter((post) => !post.is_deleted && (!post.is_private || currentUser?.id === profileData.id || iFollowThem));
      setPosts(nextPosts);
      await loadComments(nextPosts.map((post) => post.id));

      const { data: gameData } = await supabase
        .from("game_submissions")
        .select("*")
        .eq("creator_id", profileData.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      setGames(gameData || []);
    } else {
      setPosts([]);
      setGames([]);
    }
  }

  useEffect(() => { loadProfile(); }, [lookup]);

  async function login() {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/profile/${lookup}` } });
  }

  async function startConversation() {
    if (!user) return setStatus("Log in to message this creator.");
    if (!profile || user.id === profile.id) return;
    if (!mutualFollow) return setStatus("Messages only open when both people follow each other.");
    const { data, error } = await supabase.rpc("get_or_create_direct_conversation", { other_user_id: profile.id });
    if (error) return setStatus(`Message failed: ${error.message}. Run V80 SQL.`);
    window.location.href = `/messages/${data}`;
  }

  async function toggleFollow() {
    if (!user) return setStatus("Log in to follow this creator.");
    if (!profile || user.id === profile.id) return;
    const { data, error } = await supabase.rpc(following ? "unfollow_profile" : "follow_profile", { target_profile_id: profile.id });
    if (error) return setStatus(`Follow failed: ${error.message}.`);
    setFollowing(!following);
    if (following) setMutualFollow(false);
    setProfile((current) => ({ ...current, followers: Number(data?.followers ?? current.followers ?? 0) }));
  }

  async function submitComment(post) {
    if (!user) return setStatus("Log in first to comment.");
    const body = (commentTextByPost[post.id] || "").trim();
    if (!body) return;
    const { error } = await supabase.from("social_comments").insert({ post_id: post.id, user_id: user.id, body });
    if (error) return setStatus(`Comment failed: ${error.message}`);
    setCommentTextByPost((current) => ({ ...current, [post.id]: "" }));
    setPosts((current) => current.map((item) => item.id === post.id ? { ...item, comments: Number(item.comments || 0) + 1 } : item));
    await loadComments(post.id);
    setOpenPostId(post.id);
  }

  async function removeComment(post, comment) {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteSocialComment(supabase, Number(comment.id));
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, comments: Math.max(0, Number(item.comments || 0) - 1) } : item));
      await loadComments(post.id);
    } catch (error) {
      setStatus(`Delete failed: ${error.message}`);
    }
  }

  const canViewPrivate = useMemo(() => {
    if (!profile) return false;
    if (!profile.is_private) return true;
    if (user?.id === profile.id) return true;
    return following;
  }, [profile, user, following]);

  const visibleBadges = badges.slice(0, 1);
  const hiddenBadgeCount = Math.max(0, badges.length - visibleBadges.length);

  if (!profile) {
    return <main className="social-home-page"><Link className="back-link" href="/creator-hub"><ArrowLeft size={18} /> Back to Creator Hub</Link><section className="profile-hero-card signed-out"><h1>{status || "Loading profile..."}</h1></section></main>;
  }

  return (
    <main className="social-home-page">
      <Link className="back-link" href="/creator-hub"><ArrowLeft size={18} /> Back to Creator Hub</Link>

      <section className="profile-hero-card">
        <div className="profile-banner" style={{ backgroundImage: profile.banner_url ? `linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,.05)), url(${profile.banner_url})` : undefined }} />
        <div className="profile-main-row">
          <div className="profile-avatar">{profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : <UserRound size={48} />}</div>
          <div>
            <h1>{profile.display_name || "FlashPortal Creator"}</h1>
            <p className="profile-meta-line"><span>@{profile.username || "creator"}</span><span>{profile.is_private ? "Private" : "Public"}</span><span className={`profile-online-label ${isRecentlyOnline(profile.last_seen_at) ? "online" : ""}`}>{getLastSeenLabel(profile.last_seen_at)}</span><span>{canViewPrivate ? profile.bio || "No bio yet." : "This profile is private."}</span></p>
          </div>
          {user?.id !== profile.id && (user ? <div className="profile-action-stack"><button className="profile-edit-button" type="button" onClick={toggleFollow}><Heart size={16} /> {following ? "Following" : "Follow"}</button><button className="profile-edit-button secondary" type="button" onClick={startConversation}><MessageCircle size={16} /> Message</button></div> : <button className="profile-edit-button" type="button" onClick={login}>Log in to Follow</button>)}
        </div>
        <div className="profile-stats-row"><Link href={`/profile/${profile.username || profile.id}/followers`}><strong>{Number(profile.followers || 0)}</strong> Followers</Link><span><strong>{Number(profile.following || 0)}</strong> Following</span><span><strong>{games.length}</strong> Games</span><span><strong>{posts.length}</strong> Posts</span></div>
        <div className="profile-badges-row compact-badges-row">
          {badges.length ? visibleBadges.map((row) => { const badge = badgeInfo(row.badge_code); return <button type="button" onClick={() => setBadgesOpen(true)} className={`profile-badge rarity-${badge.rarity.toLowerCase()}`} title={badge.description} key={row.badge_code}>⭐ {badge.label}<small>{badge.rarity}</small></button>; }) : <span className="empty-badges">No badges earned yet.</span>}
          {hiddenBadgeCount > 0 && <button className="badge-more-button" type="button" onClick={() => setBadgesOpen(true)}>+{hiddenBadgeCount}</button>}
        </div>
      </section>

      {badgesOpen && <div className="badge-modal-backdrop" role="dialog" aria-modal="true">
        <div className="badge-modal-card">
          <button className="badge-modal-close" type="button" onClick={() => setBadgesOpen(false)}><X size={18} /></button>
          <h2>{profile.display_name || profile.username}'s badges</h2>
          <div className="badge-modal-grid">
            {badges.map((row) => { const badge = badgeInfo(row.badge_code); return <article className={`badge-modal-item rarity-${badge.rarity.toLowerCase()}`} key={row.badge_code}><strong>⭐ {badge.label}</strong><small>{badge.rarity}</small><p>{badge.description || "Earned on FlashPortal."}</p></article>; })}
          </div>
        </div>
      </div>}

      {!canViewPrivate ? <section className="private-profile-card"><EyeOff size={32} /><h2>Private profile</h2><p>Follow this creator to view their posts, games, and full profile details.</p></section> : (
        <section className="public-profile-layout">
          <article className="hub-feed-panel">
            <h2><MessageCircle size={18} /> Posts</h2>
            {posts.length ? posts.map((post) => {
              const comments = commentsByPost[post.id] || [];
              const postOwner = user?.id === post.user_id;
              const commentsOpen = openPostId === post.id;
              return <article className="social-post-card" key={post.id}>
                {post.body && <p>{post.body}</p>}
                {post.image_url && <img className="post-image" src={post.image_url} alt="Post attachment" />}
                {post.video_url && <video className="post-video" src={post.video_url} controls playsInline preload="metadata" />}
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                <div className="post-actions-row-v77">
                  <SocialReactionBar postId={Number(post.id)} initialLikes={post.likes} initialDislikes={post.dislikes} initialReaction={post.my_reaction || null} currentUserId={user?.id} />
                  <button type="button" className="reaction-pill" onClick={async () => { const next = commentsOpen ? null : post.id; setOpenPostId(next); if (next) await loadComments(post.id); }}><MessageCircle size={16} /> {Number(post.comments || comments.length || 0)} Comment</button>
                </div>
                {commentsOpen && <div className="comments-panel-v77 visible-comments-panel">
                  {comments.length ? comments.map((comment) => { const canDelete = user?.id === comment.user_id || postOwner; return <div className="comment-card-v77" key={comment.id}><strong>{comment.user_profiles?.display_name || comment.user_profiles?.username || "Player"}</strong><p>{comment.body}</p>{canDelete && <button type="button" className="tiny-danger-button" onClick={() => removeComment(post, comment)}><Trash2 size={13} /> Delete</button>}</div>; }) : <p className="empty-comments-note">No comments yet.</p>}
                  <div className="comment-input-row-v77"><input value={commentTextByPost[post.id] || ""} onChange={(event) => setCommentTextByPost((current) => ({ ...current, [post.id]: event.target.value }))} placeholder="Write a comment..." /><button type="button" onClick={() => submitComment(post)}><Send size={16} /> Send</button></div>
                </div>}
              </article>;
            }) : <p>No posts yet.</p>}
          </article>
          <article className="hub-feed-panel"><h2><Gamepad2 size={18} /> Games</h2>{games.length ? games.map((game) => <article className="creator-game-row" key={game.id}><strong>{game.title || game.game_title || "Untitled Game"}</strong><span>{game.category || "Game"}</span></article>) : <p>No approved games yet.</p>}</article>
        </section>
      )}
      {status && <p className="hub-status">{status}</p>}
    </main>
  );
}
