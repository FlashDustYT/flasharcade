"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Search, UserRound, Users } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { getLastSeenLabel, isRecentlyOnline } from "../../lib/presence";


export default function CreatorsPage() {
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadCreators() {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user || null;
    setUser(currentUser);

    if (currentUser) {
      try {
        await supabase.from("user_profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", currentUser.id);
      } catch {}
    }

    const { data: profileData, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(200);

    if (error) setStatus(`Creators need V64 SQL: ${error.message}`);
    setProfiles(profileData || []);

    if (currentUser) {
      const { data: followData } = await supabase
        .from("profile_follows")
        .select("following_id")
        .eq("follower_id", currentUser.id);
      setFollowingIds((followData || []).map((item) => item.following_id));
    }
    setLoading(false);
  }

  useEffect(() => {
    loadCreators();
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const ranked = [...profiles].sort((a, b) => Number(b.followers || 0) - Number(a.followers || 0));
    if (!needle) return ranked;
    return ranked.filter((profile) =>
      [profile.display_name, profile.username, profile.bio, profile.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [profiles, query]);

  async function login() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/creators` },
    });
  }

  async function toggleFollow(profile) {
    if (!user) {
      setStatus("Log in first to follow creators.");
      return;
    }
    if (profile.id === user.id) return setStatus("That is your own profile.");

    const alreadyFollowing = followingIds.includes(profile.id);
    const { data, error } = await supabase.rpc(alreadyFollowing ? "unfollow_profile" : "follow_profile", {
      target_profile_id: profile.id,
    });

    if (error) {
      setStatus(`Follow failed: ${error.message}. Run V64 SQL.`);
      return;
    }

    setFollowingIds((current) => alreadyFollowing ? current.filter((id) => id !== profile.id) : [...current, profile.id]);
    setProfiles((current) => current.map((item) => item.id === profile.id ? { ...item, followers: Number(data?.followers ?? item.followers ?? 0) } : item));
  }

  async function startConversation(otherUserId) {
    if (!user) {
      setStatus("Log in first to message creators.");
      return;
    }

    const { data, error } = await supabase.rpc("get_or_create_direct_conversation", {
      other_user_id: otherUserId,
    });

    if (error) {
      setStatus(`Message failed: ${error.message}. Run V69 SQL.`);
      return;
    }

    window.location.href = `/messages/${data}`;
  }


  return (
    <main className="creator-hub-page social-home-page">
      <Link className="back-link" href="/"><ArrowLeft size={18} /> Back to FlashPortal</Link>

      <section className="creator-feed-hero">
        <span><Users size={16} /> Creators</span>
        <h1>Creator Directory</h1>
        <p>Find creators, view public profiles, follow people, and reach out. Creator Hub is now just the community feed.</p>
        <label className="hub-search">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search creators..." />
        </label>
        {status && <p className="hub-status">{status}</p>}
      </section>

      <section className="creator-directory-grid">
        {filtered.length ? filtered.map((profile) => {
          const online = isRecentlyOnline(profile.last_seen_at);
          const isFollowing = followingIds.includes(profile.id);
          const isSelf = user?.id === profile.id;

          return (
            <article className="creator-directory-card" key={profile.id}>
              <div className="creator-directory-banner" style={{ backgroundImage: profile.banner_url ? `linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,.05)), url(${profile.banner_url})` : undefined }}>
                <div className="mini-avatar large">
                  {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : <UserRound size={34} />}
                  <span className={`online-dot ${online ? "online" : ""}`} title={online ? "Online now" : "Offline"} />
                </div>
              </div>
              <h2>{profile.display_name || "FlashPortal Creator"}</h2>
              <p>@{profile.username || "creator"} • {profile.is_private ? "Private" : "Public"}</p>
              <span>{profile.bio || "No bio yet."}</span>
              <div className="creator-mini-stats">
                <Link href={`/profile/${profile.username || profile.id}/followers`}>{Number(profile.followers || 0)} followers</Link>
                <small>{getLastSeenLabel(profile.last_seen_at)}</small>
              </div>
              <div className="creator-mini-actions">
                <Link href={`/profile/${profile.username || profile.id}`}>View Profile</Link>
                <button type="button" onClick={() => startConversation(profile.id)}><MessageCircle size={15} /> Message</button>
                {!isSelf && (
                  user ? (
                    <button type="button" onClick={() => toggleFollow(profile)}>{isFollowing ? "Following" : "Follow"}</button>
                  ) : (
                    <button type="button" onClick={login}>Log in to Follow</button>
                  )
                )}
              </div>
            </article>
          );
        }) : <article className="social-post-card empty"><h3>{loading ? "Loading creators..." : "No creators found."}</h3></article>}
      </section>
    </main>
  );
}
