"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, Search, UserRound, Users, Send } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

function isOnline(profile) { return profile?.last_seen_at && Date.now() - new Date(profile.last_seen_at).getTime() < 1000 * 60 * 5; }

export default function CreatorHubPage() {
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [likedPostIds, setLikedPostIds] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [openComments, setOpenComments] = useState({});

  async function loadHub() {
    let hadCache = false;
    setStatus("");

    try {
      const cached = JSON.parse(localStorage.getItem("flashportal-creator-hub-cache") || "{}");
      if (cached.profiles?.length) { setProfiles(cached.profiles); hadCache = true; }
      if (cached.posts?.length) { setPosts(cached.posts); hadCache = true; }
    } catch {}
    setLoading(!hadCache);

    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user || null;
    setUser(currentUser);

    const [{ data: profileData, error: profileError }, { data: postData, error: postError }] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("*")
        .eq("is_deleted", false)
        .order("followers", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(100),
      supabase
        .from("social_posts")
        .select("*")
        .eq("is_deleted", false)
        .eq("is_private", false)
        .order("created_at", { ascending: false })
        .limit(100)
    ]);

    if (profileError) setStatus(`Creator Hub needs V73/V74 SQL: ${profileError.message}`);
    else if (postError) setStatus(`Creator Hub posts need V74 SQL: ${postError.message}`);
    else setStatus("");

    const activeProfiles = (profileData || []).filter((profile) => !profile.is_deleted);
    const profileMap = new Map(activeProfiles.map((profile) => [profile.id, profile]));
    const hydratedPosts = (postData || []).map((post) => ({ ...post, user_profiles: profileMap.get(post.user_id) || null }));

    setProfiles(activeProfiles);
    setPosts(hydratedPosts);
    try { localStorage.setItem("flashportal-creator-hub-cache", JSON.stringify({ profiles: activeProfiles, posts: hydratedPosts })); } catch {}

    const postIds = hydratedPosts.map((post) => post.id).filter(Boolean);
    if (postIds.length) {
      const [{ data: likeRows }, { data: commentRows }] = await Promise.all([
        supabase.from("social_post_likes").select("post_id,user_id").in("post_id", postIds),
        supabase.from("social_comments").select("id,post_id,user_id,body,created_at").in("post_id", postIds).eq("is_deleted", false).order("created_at", { ascending: true })
      ]);

      const likeCounts = {};
      const likedMine = [];
      (likeRows || []).forEach((row) => {
        likeCounts[row.post_id] = (likeCounts[row.post_id] || 0) + 1;
        if (currentUser && row.user_id === currentUser.id) likedMine.push(row.post_id);
      });
      setLikedPostIds(likedMine);
      setPosts((current) => current.map((post) => ({ ...post, likes: likeCounts[post.id] ?? Number(post.likes || 0) })));

      const grouped = {};
      (commentRows || []).forEach((comment) => {
        const hydratedComment = { ...comment, user_profiles: profileMap.get(comment.user_id) || null };
        grouped[comment.post_id] = [...(grouped[comment.post_id] || []), hydratedComment];
      });
      setCommentsByPost(grouped);
      setPosts((current) => current.map((post) => ({ ...post, comments: grouped[post.id]?.length ?? Number(post.comments || 0) })));
    } else {
      setLikedPostIds([]);
      setCommentsByPost({});
    }

    if (currentUser) {
      const { data: followData } = await supabase
        .from("profile_follows")
        .select("following_id")
        .eq("follower_id", currentUser.id);

      setFollowingIds((followData || []).map((item) => item.following_id));
    } else {
      setFollowingIds([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadHub();
  }, []);

  const filteredProfiles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return profiles;

    return profiles.filter((profile) =>
      [profile.display_name, profile.username, profile.bio, profile.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [profiles, query]);

  const visiblePosts = useMemo(() => {
    return posts.filter((post) => {
      if (!post.user_profiles?.is_private) return true;
      if (!user) return false;
      if (post.user_id === user.id) return true;
      return followingIds.includes(post.user_id);
    });
  }, [posts, user, followingIds]);


  async function togglePostLike(post) {
    if (!user) return setStatus("Log in first to like posts.");
    const liked = likedPostIds.includes(post.id);
    setLikedPostIds((current) => liked ? current.filter((id) => id !== post.id) : [...current, post.id]);
    setPosts((current) => current.map((item) => item.id === post.id ? { ...item, likes: Math.max(0, Number(item.likes || 0) + (liked ? -1 : 1)) } : item));

    const { data, error } = await supabase.rpc("fp_toggle_social_like", { target_post_id: post.id });
    if (error) {
      setStatus(`Like failed: ${error.message}. Run V75 SQL.`);
      setLikedPostIds((current) => liked ? [...current, post.id] : current.filter((id) => id !== post.id));
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, likes: Math.max(0, Number(item.likes || 0) + (liked ? 1 : -1)) } : item));
      return;
    }
    if (typeof data === "number") {
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, likes: data } : item));
    }
  }

  async function sendComment(post) {
    if (!user) return setStatus("Log in first to comment.");
    const body = String(commentDrafts[post.id] || "").trim();
    if (!body) return;
    const temp = {
      id: `temp-${Date.now()}`,
      post_id: post.id,
      user_id: user.id,
      body,
      created_at: new Date().toISOString(),
      user_profiles: { display_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "You", username: user.email?.split("@")[0] || "you", avatar_url: user.user_metadata?.avatar_url || "" },
    };

    setCommentsByPost((current) => ({ ...current, [post.id]: [...(current[post.id] || []), temp] }));
    setPosts((current) => current.map((item) => item.id === post.id ? { ...item, comments: Number(item.comments || 0) + 1 } : item));
    setCommentDrafts((current) => ({ ...current, [post.id]: "" }));

    const { data, error } = await supabase
      .rpc("fp_add_social_comment", { target_post_id: post.id, comment_body: body });

    if (error) {
      setStatus(`Comment failed: ${error.message}. Run V75 SQL.`);
      return;
    }

    const saved = Array.isArray(data) ? data[0] : data;
    if (saved) {
      setCommentsByPost((current) => ({
        ...current,
        [post.id]: (current[post.id] || []).map((item) => item.id === temp.id ? { ...saved, user_profiles: temp.user_profiles } : item),
      }));
    }
  }

  async function toggleFollow(profile) {
    if (!user) {
      setStatus("Log in first to follow creators.");
      return;
    }

    if (profile.id === user.id) {
      setStatus("That is your own profile.");
      return;
    }

    const alreadyFollowing = followingIds.includes(profile.id);
    const { data, error } = await supabase.rpc(alreadyFollowing ? "unfollow_profile" : "follow_profile", {
      target_profile_id: profile.id,
    });

    if (error) {
      setStatus(`Follow failed: ${error.message}. Run V61 SQL.`);
      return;
    }

    setFollowingIds((current) =>
      alreadyFollowing ? current.filter((id) => id !== profile.id) : [...current, profile.id]
    );

    setProfiles((current) =>
      current.map((item) =>
        item.id === profile.id
          ? { ...item, followers: Number(data?.followers ?? item.followers ?? 0) }
          : item
      )
    );

    setStatus(alreadyFollowing ? "Unfollowed." : "Following.");
  }

  return (
    <main className="creator-hub-page social-home-page">
      <Link className="back-link" href="/"><ArrowLeft size={18} /> Back to FlashPortal</Link>

      <section className="creator-feed-hero">
        <span><Users size={16} /> Creator Hub</span>
        <h1>Community Feed</h1>
        <p>Latest creator/player posts, images, updates, and comments. Use Creators to browse and follow people.</p>
        <label className="hub-search">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search creators..." />
        </label>
        {status && <p className="hub-status">{status}</p>}
      </section>

      <section className="creator-hub-feed-layout">
        <section className="hub-feed-panel">
          <h2>Latest Posts</h2>
          {loading ? (
            <article className="social-post-card empty">
              <h3>Loading posts...</h3>
              <p>Getting the newest community posts.</p>
            </article>
          ) : visiblePosts.length ? (
            visiblePosts.map((post) => (
              <article className="social-post-card" key={post.id}>
                <div className="post-author-row">
                  <div className="mini-avatar">
                    {post.user_profiles?.avatar_url ? <img src={post.user_profiles.avatar_url} alt="" /> : <UserRound size={20} />}<span className={`online-dot ${isOnline(post.user_profiles) ? "online" : ""}`} />
                  </div>
                  <div>
                    <strong>{post.user_profiles?.display_name || "FlashPortal Player"}</strong>
                    <span>@{post.user_profiles?.username || "player"} • {new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {post.body && <p>{post.body}</p>}
                {post.image_url && <img className="post-image" src={post.image_url} alt="Post attachment" />}
                {post.video_url && <video className="post-video" src={post.video_url} controls playsInline preload="metadata" />}
                <div className="post-actions">
                  <button type="button" onClick={() => togglePostLike(post)} className={likedPostIds.includes(post.id) ? "active" : ""}><Heart size={16} /> {Number(post.likes || 0)}</button>
                  <button type="button" onClick={() => setOpenComments((current) => ({ ...current, [post.id]: !current[post.id] }))}><MessageCircle size={16} /> {Number(post.comments || commentsByPost[post.id]?.length || 0)} Comment</button>
                </div>
                {openComments[post.id] && (
                  <div className="comment-panel">
                    {(commentsByPost[post.id] || []).map((comment) => (
                      <div className="comment-row" key={comment.id}>
                        <strong>{comment.user_profiles?.display_name || comment.user_profiles?.username || "Player"}</strong>
                        <span>{comment.body}</span>
                      </div>
                    ))}
                    <div className="comment-compose">
                      <input value={commentDrafts[post.id] || ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} placeholder={user ? "Write a comment..." : "Log in to comment"} />
                      <button type="button" onClick={() => sendComment(post)}><Send size={15} /> Send</button>
                    </div>
                  </div>
                )}
              </article>
            ))
          ) : (
            <article className="social-post-card empty">
              <h3>No posts yet</h3>
              <p>Go to your profile page and post an update.</p><Link href="/profile">Open Profile</Link>
            </article>
          )}
        </section>

        <aside className="creator-list-panel">
          <h2>Creators</h2><p className="editor-help">Quick creator list. Full directory is on the Creators page.</p><Link className="profile-edit-button mini" href="/creators">Open Creators</Link>
          {loading ? <p>Loading creators...</p> : filteredProfiles.length ? filteredProfiles.map((profile) => {
            const isFollowing = followingIds.includes(profile.id);
            const isSelf = user?.id === profile.id;
            const canSeePrivate = !profile.is_private || isFollowing || isSelf;

            return (
              <article className="creator-mini-card" key={profile.id}>
                <div className="mini-avatar">
                  {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : <UserRound size={22} />}
                </div>
                <div>
                  <strong>{profile.display_name || "FlashPortal Creator"}</strong>
                  <span>@{profile.username || "creator"}</span>
                  <p>{canSeePrivate ? profile.bio || "No bio yet." : "Private profile"}</p>

                  <div className="creator-mini-stats">
                    <Link href={`/profile/${profile.username || profile.id}/followers`}>{Number(profile.followers || 0)} followers</Link>
                    <small>{profile.is_private ? "Private" : "Public"}</small>
                  </div>

                  <div className="creator-mini-actions">
                    <Link href={`/profile/${profile.username || profile.id}`}>View Profile</Link>
                    {!isSelf && (
                      <button type="button" onClick={() => toggleFollow(profile)}>
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          }) : <p>No creators found yet.</p>}
        </aside>
      </section>
    </main>
  );
}
