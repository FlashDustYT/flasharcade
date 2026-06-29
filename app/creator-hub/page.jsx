"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, Search, UserRound, Users } from "lucide-react";

function isOnline(profile) { return profile?.last_seen_at && Date.now() - new Date(profile.last_seen_at).getTime() < 1000 * 60 * 5; }
import { supabase } from "../../lib/supabaseClient";

export default function CreatorHubPage() {
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Loading community feed...");
  const [loading, setLoading] = useState(true);

  async function loadHub() {
    setLoading(true);
    setStatus("Loading community feed...");
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

    if (profileError) setStatus(`Creator Hub needs V73 SQL: ${profileError.message}`);
    else if (postError) setStatus(`Creator Hub posts need V73 SQL: ${postError.message}`);
    else setStatus("");

    const activeProfiles = (profileData || []).filter((profile) => !profile.is_deleted);
    const profileMap = new Map(activeProfiles.map((profile) => [profile.id, profile]));
    const hydratedPosts = (postData || []).map((post) => ({ ...post, user_profiles: profileMap.get(post.user_id) || null }));

    setProfiles(activeProfiles);
    setPosts(hydratedPosts);

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
                  <button type="button"><Heart size={16} /> {Number(post.likes || 0)}</button>
                  <button type="button"><MessageCircle size={16} /> Comment</button>
                </div>
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
