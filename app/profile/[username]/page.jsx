"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, EyeOff, Gamepad2, Heart, MessageCircle, UserRound } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

export default function PublicProfilePage({ params }) {
  const username = params.username;
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [games, setGames] = useState([]);
  const [following, setFollowing] = useState(false);
  const [status, setStatus] = useState("");

  async function loadProfile() {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user || null;
    setUser(currentUser);

    const { data: profileData, error } = await supabase
      .from("user_profiles")
      .select("*")
      .or(`username.eq.${username},id.eq.${username}`)
      .maybeSingle();

    if (error || !profileData) {
      setStatus("Profile not found.");
      return;
    }

    setProfile(profileData);

    let isFollowing = false;
    if (currentUser) {
      const { data: followData } = await supabase
        .from("profile_follows")
        .select("id")
        .eq("follower_id", currentUser.id)
        .eq("following_id", profileData.id)
        .maybeSingle();

      isFollowing = Boolean(followData);
      setFollowing(isFollowing);
    }

    const canView = !profileData.is_private || currentUser?.id === profileData.id || isFollowing;

    if (canView) {
      const { data: postData } = await supabase
        .from("social_posts")
        .select("*")
        .eq("user_id", profileData.id)
        .order("created_at", { ascending: false })
        .limit(40);

      setPosts(postData || []);

      const { data: gameData } = await supabase
        .from("game_submissions")
        .select("*")
        .eq("creator_id", profileData.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      setGames(gameData || []);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [username]);

  async function toggleFollow() {
    if (!user) {
      setStatus("Log in to follow this creator.");
      return;
    }
    if (!profile || user.id === profile.id) return;

    const fn = following ? "unfollow_profile" : "follow_profile";
    const { data, error } = await supabase.rpc(fn, { target_profile_id: profile.id });

    if (error) {
      setStatus(`Follow failed: ${error.message}. Run V59 SQL.`);
      return;
    }

    setFollowing(!following);
    setProfile((current) => ({ ...current, followers: Number(data?.followers ?? current.followers ?? 0) }));
  }

  const canViewPrivate = useMemo(() => {
    if (!profile) return false;
    if (!profile.is_private) return true;
    if (user?.id === profile.id) return true;
    return following;
  }, [profile, user, following]);

  if (!profile) {
    return (
      <main className="social-home-page">
        <Link className="back-link" href="/creator-hub"><ArrowLeft size={18} /> Back to Creator Hub</Link>
        <section className="profile-hero-card signed-out"><h1>{status || "Loading profile..."}</h1></section>
      </main>
    );
  }

  return (
    <main className="social-home-page">
      <Link className="back-link" href="/creator-hub"><ArrowLeft size={18} /> Back to Creator Hub</Link>

      <section className="profile-hero-card">
        <div
          className="profile-banner"
          style={{
            backgroundImage: profile.banner_url
              ? `linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,.05)), url(${profile.banner_url})`
              : undefined,
          }}
        />

        <div className="profile-main-row">
          <div className="profile-avatar">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : <UserRound size={48} />}
          </div>
          <div>
            <h1>{profile.display_name || "FlashPortal Creator"}</h1>
            <p>@{profile.username || "creator"} {profile.is_private ? "• Private" : "• Public"}</p>
            <span>{canViewPrivate ? profile.bio || "No bio yet." : "This profile is private."}</span>
          </div>
          {user?.id !== profile.id && (
            <button className="profile-edit-button" type="button" onClick={toggleFollow}>
              <Heart size={16} /> {following ? "Following" : "Follow"}
            </button>
          )}
        </div>

        <div className="profile-stats-row">
          <span><strong>{Number(profile.followers || 0)}</strong> Followers</span>
          <span><strong>{Number(profile.following || 0)}</strong> Following</span>
          <span><strong>{games.length}</strong> Games</span>
          <span><strong>{posts.length}</strong> Posts</span>
        </div>
      </section>

      {!canViewPrivate ? (
        <section className="private-profile-card">
          <EyeOff size={32} />
          <h2>Private profile</h2>
          <p>Follow this creator to view their posts, games, and full profile details if they allow followers.</p>
        </section>
      ) : (
        <section className="public-profile-layout">
          <article className="hub-feed-panel">
            <h2><MessageCircle size={18} /> Posts</h2>
            {posts.length ? posts.map((post) => (
              <article className="social-post-card" key={post.id}>
                {post.body && <p>{post.body}</p>}
                {post.image_url && <img className="post-image" src={post.image_url} alt="Post attachment" />}
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </article>
            )) : <p>No posts yet.</p>}
          </article>

          <article className="hub-feed-panel">
            <h2><Gamepad2 size={18} /> Games</h2>
            {games.length ? games.map((game) => (
              <article className="creator-game-row" key={game.id}>
                <strong>{game.title || game.game_title || "Untitled Game"}</strong>
                <span>{game.category || "Game"} • {new Date(game.created_at).toLocaleDateString()}</span>
              </article>
            )) : <p>No approved games yet.</p>}
          </article>
        </section>
      )}

      {status && <p className="hub-status">{status}</p>}
    </main>
  );
}
