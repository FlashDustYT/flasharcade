"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, EyeOff, Globe2, Save, Send, UserRound } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { cleanUsername, ensureUserProfile, profileFromUser } from "../../lib/profileHelpers";

export default function MyProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postBody, setPostBody] = useState("");
  const [postImage, setPostImage] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user || null;
    setUser(currentUser);

    if (!currentUser) return;

    try {
      const loadedProfile = await ensureUserProfile(supabase, currentUser);
      setProfile(loadedProfile);
      setDraft(loadedProfile);
    } catch (error) {
      const fallback = profileFromUser(currentUser);
      setProfile(fallback);
      setDraft(fallback);
      setStatus(`Profile database is not ready: ${error.message}. Run V61 SQL.`);
    }

    const { data: postData } = await supabase
      .from("social_posts")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setPosts(postData || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function login() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/profile` },
    });
  }

  async function saveProfile() {
    if (!user || !draft) return;

    const payload = {
      id: user.id,
      email: user.email,
      display_name: draft.display_name?.trim() || "FlashPortal Player",
      username: cleanUsername(draft.username),
      bio: draft.bio?.trim() || "",
      avatar_url: draft.avatar_url?.trim() || "",
      banner_url: draft.banner_url?.trim() || "",
      is_private: Boolean(draft.is_private),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(payload, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      setStatus(`Profile save failed: ${error.message}. Run V61 SQL, then refresh.`);
      return;
    }

    setProfile(data);
    setDraft(data);
    setStatus("Profile saved.");
  }

  async function publishPost() {
    if (!user) return;
    if (!postBody.trim() && !postImage.trim()) {
      setStatus("Write something or add an image URL first.");
      return;
    }

    const { data, error } = await supabase
      .from("social_posts")
      .insert({ user_id: user.id, body: postBody.trim(), image_url: postImage.trim() })
      .select("*")
      .single();

    if (error) {
      setStatus(`Post failed: ${error.message}. Run V61 SQL.`);
      return;
    }

    setPosts((current) => [data, ...current]);
    setPostBody("");
    setPostImage("");
    setStatus("Post published.");
  }

  if (!user) {
    return (
      <main className="social-home-page">
        <Link className="back-link" href="/"><ArrowLeft size={18} /> Back to FlashPortal</Link>
        <section className="profile-hero-card signed-out">
          <UserRound size={42} />
          <h1>Create your FlashPortal profile</h1>
          <p>Log in first, then you can change username, avatar, banner, bio, posts, and privacy.</p>
          <button type="button" onClick={login}>Login with Google</button>
        </section>
      </main>
    );
  }

  const shown = profile || profileFromUser(user);

  return (
    <main className="social-home-page">
      <Link className="back-link" href="/"><ArrowLeft size={18} /> Back to FlashPortal</Link>

      <section className="profile-hero-card">
        <div
          className="profile-banner"
          style={{
            backgroundImage: shown.banner_url
              ? `linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,.05)), url(${shown.banner_url})`
              : undefined,
          }}
        />
        <div className="profile-main-row">
          <div className="profile-avatar">
            {shown.avatar_url ? <img src={shown.avatar_url} alt="" /> : <UserRound size={48} />}
          </div>
          <div>
            <h1>{shown.display_name || "FlashPortal Player"}</h1>
            <p>@{shown.username || "player"} {shown.is_private ? "• Private" : "• Public"}</p>
            <span>{shown.bio || "No bio yet."}</span>
          </div>
          <Link className="profile-edit-button" href={`/profile/${shown.username || shown.id}`}>View Public Page</Link>
        </div>

        <div className="profile-stats-row">
          <Link href={`/profile/${shown.username || shown.id}/followers`}><strong>{Number(shown.followers || 0)}</strong> Followers</Link>
          <span><strong>{Number(shown.following || 0)}</strong> Following</span>
          <span><strong>{posts.length}</strong> Posts</span>
        </div>
      </section>

      <section className="profile-edit-panel always-open-profile-editor">
        <h2>Edit Your Profile</h2>
        <p className="editor-help">Paste image URLs for now. Upload buttons can come later, but username/PFP/banner/bio save now.</p>

        <label>Display name
          <input value={draft?.display_name || ""} onChange={(event) => setDraft({ ...draft, display_name: event.target.value })} />
        </label>

        <label>Username
          <input value={draft?.username || ""} onChange={(event) => setDraft({ ...draft, username: cleanUsername(event.target.value) })} />
        </label>

        <label>Bio
          <textarea value={draft?.bio || ""} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} />
        </label>

        <label>Profile picture URL
          <input value={draft?.avatar_url || ""} onChange={(event) => setDraft({ ...draft, avatar_url: event.target.value })} placeholder="https://..." />
        </label>

        <label>Banner image URL
          <input value={draft?.banner_url || ""} onChange={(event) => setDraft({ ...draft, banner_url: event.target.value })} placeholder="https://..." />
        </label>

        <label className="privacy-toggle-row">
          <input type="checkbox" checked={Boolean(draft?.is_private)} onChange={(event) => setDraft({ ...draft, is_private: event.target.checked })} />
          {draft?.is_private ? <EyeOff size={16} /> : <Globe2 size={16} />}
          Private profile
        </label>

        <button type="button" onClick={saveProfile}><Save size={16} /> Save Profile</button>
        {status && <p className="hub-status">{status}</p>}
      </section>

      <section className="social-layout">
        <aside className="social-sidebar-card">
          <h3>Profile links</h3>
          <Link href="/creator-hub">Creator Hub Feed</Link>
          <Link href="/about">About / Roadmap</Link>
        </aside>

        <section className="social-feed-column">
          <article className="post-composer">
            <h2>Post an update</h2>
            <textarea value={postBody} onChange={(event) => setPostBody(event.target.value)} placeholder="Share an update, image, patch note, stream note..." />
            <input value={postImage} onChange={(event) => setPostImage(event.target.value)} placeholder="Optional image URL" />
            <button type="button" onClick={publishPost}><Send size={16} /> Post</button>
          </article>

          {posts.map((post) => (
            <article className="social-post-card" key={post.id}>
              {post.body && <p>{post.body}</p>}
              {post.image_url && <img className="post-image" src={post.image_url} alt="Post attachment" />}
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
