"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, EyeOff, Heart, MessageCircle, Search, UserRound, Users } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function CreatorHubPage() {
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  async function loadHub() {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user || null;
    setUser(currentUser);

    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(100);

    const { data: postData } = await supabase
      .from("social_posts")
      .select("*, user_profiles(display_name, username, avatar_url, is_private)")
      .order("created_at", { ascending: false })
      .limit(80);

    setProfiles(profileData || []);
    setPosts(postData || []);

    if (currentUser) {
      const { data: followData } = await supabase
        .from("profile_follows")
        .select("following_id")
        .eq("follower_id", currentUser.id);

      setFollowingIds((followData || []).map((item) => item.following_id));
    }
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
      const owner = post.user_profiles || {};
      if (!owner.is_private) return true;
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
    const fn = alreadyFollowing ? "unfollow_profile" : "follow_profile";
    const { data, error } = await supabase.rpc(fn, { target_profile_id: profile.id });

    if (error) {
      setStatus(`Follow failed: ${error.message}. Run V59 SQL.`);
      return;
    }

    setFollowingIds((current) =>
      alreadyFollowing ? current.filter((id) => id !== profile.id) : [...current, profile.id]
    );

    setProfiles((current) =>
      current.map((item) =>
        item.id === profile.id ? { ...item, followers: Number(data?.followers ?? item.followers ?? 0) } : item
      )
    );

    setStatus(alreadyFollowing ? "Unfollowed." : "Following.");
  }

  return (
    <main className="creator-hub-page social-home-page">
      <Link className="back-link" href="/">
        <ArrowLeft size={18} /> Back to FlashPortal
      </Link>

      <section className="creator-hub-hero">
        <span><Users size={16} /> Creator Hub</span>
        <h1>Creator Home Feed</h1>
        <p>Find creators, follow updates, see public posts, and view profiles. Private profiles hide posts/details unless you follow them.</p>

        <label className="hub-search">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search creators, usernames, bios..." />
        </label>

        {status && <p className="hub-status">{status}</p>}
      </section>

      <section className="creator-hub-grid">
        <aside className="creator-list-panel">
          <h2>Creators</h2>
          {filteredProfiles.length ? (
            filteredProfiles.map((profile) => {
              const isFollowing = followingIds.includes(profile.id);
              const isSelf = user?.id === profile.id;
              const canViewPrivate = !profile.is_private || isSelf || isFollowing;

              return (
                <article className="creator-mini-card" key={profile.id}>
                  <div className="mini-avatar">
                    {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : <UserRound size={22} />}
                  </div>
                  <div>
                    <strong>{profile.display_name || "FlashPortal Creator"}</strong>
                    <span>@{profile.username || "creator"}</span>
                    <p>{canViewPrivate ? profile.bio || "No bio yet." : "Private profile"}</p>
                    <div className="creator-mini-stats">
                      <small>{Number(profile.followers || 0)} followers</small>
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
            })
          ) : (
            <p>No creators found yet. Creator profiles appear here after users save their profile.</p>
          )}
        </aside>

        <section className="hub-feed-panel">
          <h2>Latest Posts</h2>
          {visiblePosts.length ? (
            visiblePosts.map((post) => (
              <article className="social-post-card" key={post.id}>
                <div className="post-author-row">
                  <div className="mini-avatar">
                    {post.user_profiles?.avatar_url ? <img src={post.user_profiles.avatar_url} alt="" /> : <UserRound size={20} />}
                  </div>
                  <div>
                    <strong>{post.user_profiles?.display_name || "FlashPortal Player"}</strong>
                    <span>@{post.user_profiles?.username || "player"} • {new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {post.user_profiles?.is_private && (
                  <p className="private-post-note"><EyeOff size={14} /> Private post visible because you follow this creator.</p>
                )}
                {post.body && <p>{post.body}</p>}
                {post.image_url && <img className="post-image" src={post.image_url} alt="Post attachment" />}
                <div className="post-actions">
                  <button type="button"><Heart size={16} /> {Number(post.likes || 0)}</button>
                  <button type="button"><MessageCircle size={16} /> Comment</button>
                </div>
              </article>
            ))
          ) : (
            <article className="social-post-card empty">
              <h3>No public posts yet</h3>
              <p>Public creator/player posts will appear here. Private posts only appear to followers.</p>
            </article>
          )}
        </section>
      </section>
    </main>
  );
}
