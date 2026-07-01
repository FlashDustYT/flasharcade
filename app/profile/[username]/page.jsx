"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, EyeOff, Gamepad2, Heart, MessageCircle, UserRound } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { getLastSeenLabel, isRecentlyOnline } from "../../../lib/presence";
import { awardEarlyBuildBadges, badgeInfo } from "../../../lib/badges";

function safeLookup(value) { return String(value || "").toLowerCase().replace(/^@+/, "").replace(/[^a-z0-9_.@-]/g, ""); }

export default function PublicProfilePage({ params }) {
  const lookup = params.username;
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [games, setGames] = useState([]);
  const [following, setFollowing] = useState(false);
  const [status, setStatus] = useState("");
  const [badges, setBadges] = useState([]);

  async function loadProfile() {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user || null;
    setUser(currentUser);

    const cleanedLookup = safeLookup(lookup);
    const { data: allProfiles, error } = await supabase
      .from("user_profiles")
      .select("*")
      .limit(500);

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

    let isFollowing = false;

    if (currentUser) {
      try { await awardEarlyBuildBadges(supabase, currentUser.id); } catch {}
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

    if (canView) {
      let postQuery = supabase
        .from("social_posts")
        .select("*")
        .eq("user_id", profileData.id)
        .order("created_at", { ascending: false })
        .limit(50);

      const { data: postData } = await postQuery;
      setPosts((postData || []).filter((post) => !post.is_deleted && (!post.is_private || currentUser?.id === profileData.id || isFollowing)));

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

  useEffect(() => {
    loadProfile();
  }, [lookup]);

  async function login() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/profile/${lookup}` },
    });
  }

  async function startConversation() {
    if (!user) {
      setStatus("Log in to message this creator.");
      return;
    }

    if (!profile || user.id === profile.id) return;

    const { data, error } = await supabase.rpc("get_or_create_direct_conversation", {
      other_user_id: profile.id,
    });

    if (error) {
      setStatus(`Message failed: ${error.message}. Run V69 SQL.`);
      return;
    }

    window.location.href = `/messages/${data}`;
  }

  async function toggleFollow() {
    if (!user) {
      setStatus("Log in to follow this creator.");
      return;
    }

    if (!profile || user.id === profile.id) return;

    const { data, error } = await supabase.rpc(following ? "unfollow_profile" : "follow_profile", {
      target_profile_id: profile.id,
    });

    if (error) {
      setStatus(`Follow failed: ${error.message}. Run V61 SQL.`);
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
            <p className="profile-meta-line"><span>@{profile.username || "creator"}</span><span>{profile.is_private ? "Private" : "Public"}</span><span className={`profile-online-label ${isRecentlyOnline(profile.last_seen_at) ? "online" : ""}`}>{getLastSeenLabel(profile.last_seen_at)}</span><span>{canViewPrivate ? profile.bio || "No bio yet." : "This profile is private."}</span></p>
          </div>

          {user?.id !== profile.id && (
            user ? (
              <div className="profile-action-stack">
                <button className="profile-edit-button" type="button" onClick={toggleFollow}>
                  <Heart size={16} /> {following ? "Following" : "Follow"}
                </button>
                <button className="profile-edit-button secondary" type="button" onClick={startConversation}>
                  <MessageCircle size={16} /> Message
                </button>
              </div>
            ) : (
              <button className="profile-edit-button" type="button" onClick={login}>
                Log in to Follow
              </button>
            )
          )}
        </div>

        <div className="profile-stats-row">
          <Link href={`/profile/${profile.username || profile.id}/followers`}><strong>{Number(profile.followers || 0)}</strong> Followers</Link>
          <span><strong>{Number(profile.following || 0)}</strong> Following</span>
          <span><strong>{games.length}</strong> Games</span>
          <span><strong>{posts.length}</strong> Posts</span>
        </div>
        <div className="profile-badges-row">
          {badges.length ? badges.map((row) => {
            const badge = badgeInfo(row.badge_code);
            return <span className={`profile-badge rarity-${badge.rarity.toLowerCase()}`} title={badge.description} key={row.badge_code}>⭐ {badge.label}<small>{badge.rarity}</small></span>;
          }) : <span className="empty-badges">No badges earned yet.</span>}
        </div>
      </section>

      {!canViewPrivate ? (
        <section className="private-profile-card">
          <EyeOff size={32} />
          <h2>Private profile</h2>
          <p>Follow this creator to view their posts, games, and full profile details.</p>
        </section>
      ) : (
        <section className="public-profile-layout">
          <article className="hub-feed-panel">
            <h2><MessageCircle size={18} /> Posts</h2>
            {posts.length ? posts.map((post) => (
              <article className="social-post-card" key={post.id}>
                {post.body && <p>{post.body}</p>}
                {post.image_url && <img className="post-image" src={post.image_url} alt="Post attachment" />}
                {post.video_url && <video className="post-video" src={post.video_url} controls playsInline preload="metadata" />}
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </article>
            )) : <p>No posts yet.</p>}
          </article>

          <article className="hub-feed-panel">
            <h2><Gamepad2 size={18} /> Games</h2>
            {games.length ? games.map((game) => (
              <article className="creator-game-row" key={game.id}>
                <strong>{game.title || game.game_title || "Untitled Game"}</strong>
                <span>{game.category || "Game"}</span>
              </article>
            )) : <p>No approved games yet.</p>}
          </article>
        </section>
      )}

      {status && <p className="hub-status">{status}</p>}
    </main>
  );
}
