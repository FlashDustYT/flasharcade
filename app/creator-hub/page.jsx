"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, Search, UserRound, Users } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function CreatorHubPage() {
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function loadHub() {
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(50);

      const { data: postData } = await supabase
        .from("social_posts")
        .select("*, user_profiles(display_name, username, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(50);

      setProfiles(profileData || []);
      setPosts(postData || []);
    }

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

  return (
    <main className="creator-hub-page social-home-page">
      <Link className="back-link" href="/">
        <ArrowLeft size={18} /> Back to FlashPortal
      </Link>

      <section className="creator-hub-hero">
        <span><Users size={16} /> Creator Hub</span>
        <h1>Creator Home Feed</h1>
        <p>Find creators, follow updates, comment on posts, and keep up with what people are building on FlashPortal.</p>

        <label className="hub-search">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search creators, usernames, bios..." />
        </label>
      </section>

      <section className="creator-hub-grid">
        <aside className="creator-list-panel">
          <h2>Creators</h2>
          {filteredProfiles.length ? (
            filteredProfiles.map((profile) => (
              <article className="creator-mini-card" key={profile.id}>
                <div className="mini-avatar">
                  {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : <UserRound size={22} />}
                </div>
                <div>
                  <strong>{profile.display_name || "FlashPortal Creator"}</strong>
                  <span>@{profile.username || "creator"}</span>
                  <p>{profile.bio || "No bio yet."}</p>
                </div>
              </article>
            ))
          ) : (
            <p>No creators found yet. Creator profiles appear here after users save their profile.</p>
          )}
        </aside>

        <section className="hub-feed-panel">
          <h2>Latest Posts</h2>
          {posts.length ? (
            posts.map((post) => (
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
              <h3>No creator posts yet</h3>
              <p>Posts from creators and players will show here after V58 SQL is run and users start posting.</p>
            </article>
          )}
        </section>
      </section>
    </main>
  );
}
