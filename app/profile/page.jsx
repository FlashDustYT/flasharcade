"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AtSign,
  Camera,
  Gamepad2,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Save,
  Send,
  Settings,
  Star,
  UserRound,
  Users,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

function cleanUsername(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_\.]/g, "")
    .slice(0, 24);
}

function fallbackProfile(user) {
  const emailName = user?.email?.split("@")[0] || "player";
  return {
    display_name: user?.user_metadata?.full_name || emailName,
    username: cleanUsername(emailName),
    bio: "Playing games on FlashPortal.",
    avatar_url: user?.user_metadata?.avatar_url || "",
    banner_url: "",
    is_private: false,
  };
}

export default function ProfileHomePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [draftProfile, setDraftProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postDraft, setPostDraft] = useState("");
  const [imageDraft, setImageDraft] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(false);

  async function loadProfile(currentUser) {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    const fallback = fallbackProfile(currentUser);

    if (!error && data) {
      const merged = { ...fallback, ...data };
      setProfile(merged);
      setDraftProfile(merged);
      return;
    }

    const insertPayload = {
      id: currentUser.id,
      email: currentUser.email,
      ...fallback,
    };

    await supabase.from("user_profiles").upsert(insertPayload, { onConflict: "id" });

    setProfile(insertPayload);
    setDraftProfile(insertPayload);
  }

  async function loadPosts() {
    const { data, error } = await supabase
      .from("social_posts")
      .select("*, user_profiles(display_name, username, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setPosts(data);
      return;
    }

    try {
      setPosts(JSON.parse(localStorage.getItem("flashportal-social-posts") || "[]"));
    } catch {
      setPosts([]);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const currentUser = data?.session?.user || null;
      setUser(currentUser);
      if (currentUser) await loadProfile(currentUser);
      await loadPosts();
    });
  }, []);

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/profile` },
    });
  }

  async function saveProfile() {
    if (!user || !draftProfile) return;

    const payload = {
      id: user.id,
      email: user.email,
      display_name: draftProfile.display_name?.trim() || "FlashPortal Player",
      username: cleanUsername(draftProfile.username),
      bio: draftProfile.bio?.trim() || "",
      avatar_url: draftProfile.avatar_url?.trim() || "",
      banner_url: draftProfile.banner_url?.trim() || "",
      is_private: Boolean(draftProfile.is_private),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("user_profiles").upsert(payload, { onConflict: "id" });

    if (error) {
      setStatus(`Profile save failed: ${error.message}. Run V58 SQL.`);
      return;
    }

    setProfile(payload);
    setDraftProfile(payload);
    setEditing(false);
    setStatus("Profile updated.");
  }

  async function publishPost() {
    if (!user) {
      setStatus("Log in first.");
      return;
    }

    const body = postDraft.trim();
    const imageUrl = imageDraft.trim();

    if (!body && !imageUrl) {
      setStatus("Write something or add an image URL first.");
      return;
    }

    const payload = {
      user_id: user.id,
      body,
      image_url: imageUrl,
    };

    const { data, error } = await supabase
      .from("social_posts")
      .insert(payload)
      .select("*, user_profiles(display_name, username, avatar_url)")
      .single();

    if (!error && data) {
      setPosts((current) => [data, ...current]);
      setPostDraft("");
      setImageDraft("");
      setStatus("Posted.");
      return;
    }

    const fallbackPost = {
      id: `local-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
      likes: 0,
      user_profiles: profile,
      comments: [],
    };
    const next = [fallbackPost, ...posts];
    setPosts(next);
    localStorage.setItem("flashportal-social-posts", JSON.stringify(next));
    setPostDraft("");
    setImageDraft("");
    setStatus("Posted locally. Run V58 SQL to make posts public.");
  }

  async function likePost(postId) {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, likes: Number(post.likes || 0) + 1 } : post
      )
    );

    await supabase.rpc("increment_social_post_like", { target_post_id: postId }).catch(() => {});
  }

  const stats = useMemo(() => {
    return {
      posts: posts.filter((post) => post.user_id === user?.id).length,
      followers: Number(profile?.followers || 0),
      following: Number(profile?.following || 0),
    };
  }, [posts, profile, user]);

  if (!user) {
    return (
      <main className="social-home-page">
        <Link className="back-link" href="/">
          <ArrowLeft size={18} /> Back to FlashPortal
        </Link>

        <section className="profile-hero-card signed-out">
          <UserRound size={42} />
          <h1>Create your FlashPortal home page</h1>
          <p>Log in to set your username, profile, bio, posts, images, friends, and creator updates.</p>
          <button type="button" onClick={signIn}>Login with Google</button>
        </section>
      </main>
    );
  }

  const shownProfile = profile || fallbackProfile(user);

  return (
    <main className="social-home-page">
      <Link className="back-link" href="/">
        <ArrowLeft size={18} /> Back to FlashPortal
      </Link>

      <section className="profile-hero-card">
        <div
          className="profile-banner"
          style={{
            backgroundImage: shownProfile.banner_url
              ? `linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,.05)), url(${shownProfile.banner_url})`
              : undefined,
          }}
        />

        <div className="profile-main-row">
          <div className="profile-avatar">
            {shownProfile.avatar_url ? <img src={shownProfile.avatar_url} alt="" /> : <UserRound size={48} />}
          </div>

          <div>
            <h1>{shownProfile.display_name}</h1>
            <p><AtSign size={16} /> {shownProfile.username}</p>
            <span>{shownProfile.bio}</span>
          </div>

          <button className="profile-edit-button" type="button" onClick={() => setEditing((current) => !current)}>
            <Settings size={16} /> Edit Profile
          </button>
        </div>

        <div className="profile-stats-row">
          <span><strong>{stats.posts}</strong> Posts</span>
          <span><strong>{stats.followers}</strong> Followers</span>
          <span><strong>{stats.following}</strong> Following</span>
          <span><strong>0</strong> Friends</span>
        </div>
      </section>

      {editing && draftProfile && (
        <section className="profile-edit-panel">
          <h2>Edit Profile</h2>
          <label>
            Display name
            <input value={draftProfile.display_name || ""} onChange={(event) => setDraftProfile({ ...draftProfile, display_name: event.target.value })} />
          </label>
          <label>
            Username
            <input value={draftProfile.username || ""} onChange={(event) => setDraftProfile({ ...draftProfile, username: cleanUsername(event.target.value) })} />
          </label>
          <label>
            Bio
            <textarea value={draftProfile.bio || ""} onChange={(event) => setDraftProfile({ ...draftProfile, bio: event.target.value })} />
          </label>
          <label>
            Avatar image URL
            <input value={draftProfile.avatar_url || ""} onChange={(event) => setDraftProfile({ ...draftProfile, avatar_url: event.target.value })} placeholder="https://..." />
          </label>
          <label>
            Banner image URL
            <input value={draftProfile.banner_url || ""} onChange={(event) => setDraftProfile({ ...draftProfile, banner_url: event.target.value })} placeholder="https://..." />
          </label>
          <label className="privacy-toggle-row">
            <input
              type="checkbox"
              checked={Boolean(draftProfile.is_private)}
              onChange={(event) => setDraftProfile({ ...draftProfile, is_private: event.target.checked })}
            />
            Private profile — only followers/friends can view posts and full profile details.
          </label>
          <button type="button" onClick={saveProfile}><Save size={16} /> Save Profile</button>
        </section>
      )}

      <section className="social-layout">
        <aside className="social-sidebar-card">
          <h3>Quick Links</h3>
          <Link href="/creator/upload"><Gamepad2 size={16} /> Upload Game</Link>
          <Link href="/creator-checkout"><Star size={16} /> Creator Plans</Link>
          <Link href="/reviews"><MessageCircle size={16} /> Reviews</Link>
          <Link href="/"><Heart size={16} /> Playlist</Link>
        </aside>

        <section className="social-feed-column">
          <article className="post-composer">
            <h2>Post an update</h2>
            <textarea value={postDraft} onChange={(event) => setPostDraft(event.target.value)} placeholder="Share an update, game progress, patch notes, stream plans..." />
            <input value={imageDraft} onChange={(event) => setImageDraft(event.target.value)} placeholder="Optional image URL" />
            <button type="button" onClick={publishPost}><Send size={16} /> Post</button>
            {status && <p>{status}</p>}
          </article>

          <div className="social-feed">
            {posts.length ? (
              posts.map((post) => {
                const postProfile = post.user_profiles || {};
                return (
                  <article className="social-post-card" key={post.id}>
                    <div className="post-author-row">
                      <div className="mini-avatar">
                        {postProfile.avatar_url ? <img src={postProfile.avatar_url} alt="" /> : <UserRound size={20} />}
                      </div>
                      <div>
                        <strong>{postProfile.display_name || "FlashPortal Player"}</strong>
                        <span>@{postProfile.username || "player"} • {post.created_at ? new Date(post.created_at).toLocaleDateString() : "Just now"}</span>
                      </div>
                    </div>

                    {post.body && <p>{post.body}</p>}
                    {post.image_url && <img className="post-image" src={post.image_url} alt="Post attachment" />}

                    <div className="post-actions">
                      <button type="button" onClick={() => likePost(post.id)}><Heart size={16} /> {Number(post.likes || 0)}</button>
                      <button type="button"><MessageCircle size={16} /> Comment</button>
                    </div>
                  </article>
                );
              })
            ) : (
              <article className="social-post-card empty">
                <ImageIcon size={30} />
                <h3>No posts yet</h3>
                <p>Creator updates, images, patch notes, and player posts will appear here.</p>
              </article>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
