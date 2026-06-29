"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, EyeOff, Globe2, ImagePlus, Save, Send, Trash2, UserRound, Video, Github, Lock, AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { cleanUsername, ensureUserProfile, profileFromUser } from "../../lib/profileHelpers";
import { awardBadge, badgeInfo } from "../../lib/badges";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function MyProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postBody, setPostBody] = useState("");
  const [postImage, setPostImage] = useState("");
  const [postVideo, setPostVideo] = useState("");
  const [postAudience, setPostAudience] = useState("community");
  const [status, setStatus] = useState("");
  const [badges, setBadges] = useState([]);

  async function touchSeen(currentUser) {
    if (!currentUser) return;
    try {
      await supabase.from("user_profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", currentUser.id);
    } catch {}
  }

  async function load() {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user || null;
    setUser(currentUser);

    if (!currentUser) return;

    try {
      const loadedProfile = await ensureUserProfile(supabase, currentUser);
      setProfile(loadedProfile);
      setDraft(loadedProfile);
      await touchSeen(currentUser);
    } catch (error) {
      const fallback = profileFromUser(currentUser);
      setProfile(fallback);
      setDraft(fallback);
      setStatus(`Profile database is not ready: ${error.message}. Run V71 SQL.`);
    }

    const { data: postData } = await supabase
      .from("social_posts")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setPosts((postData || []).filter((post) => !post.is_deleted));

    try {
      await awardBadge(supabase, currentUser.id, "early_player");
      const { data: badgeData } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("earned_at", { ascending: false });
      setBadges(badgeData || []);
    } catch {}
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

  async function loginWithGithub() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/profile` },
    });
  }

  async function sendPasswordReset() {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/profile`,
    });
    setStatus(error ? `Password reset failed: ${error.message}` : "Password reset email sent.");
  }

  async function uploadMediaToStorage(file) {
    if (!user || !file) return "";
    const safeName = file.name.replace(/[^a-z0-9._-]/gi, "_");
    const path = `${user.id}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from("profile-media").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

    if (error) throw error;

    const { data } = supabase.storage.from("profile-media").getPublicUrl(path);
    return data?.publicUrl || "";
  }

  async function handleMediaFile(kind, file) {
    if (!file) return;
    const isVideo = file.type?.startsWith("video/");
    setStatus(isVideo ? "Loading video..." : "Loading image...");

    if (kind === "post") {
      try {
        const publicUrl = await uploadMediaToStorage(file);
        if (isVideo) {
          setPostVideo(publicUrl);
          setPostImage("");
        } else {
          setPostImage(publicUrl);
          setPostVideo("");
        }
        setStatus(isVideo ? "Video uploaded. Post to publish it." : "Image uploaded. Post to publish it.");
        return;
      } catch (error) {
        setStatus(`Media upload failed: ${error.message}. Run V71 SQL and check Storage.`);
        return;
      }
    }

    const dataUrl = await fileToDataUrl(file);
    if (kind === "avatar") setDraft((current) => ({ ...current, avatar_url: dataUrl }));
    if (kind === "banner") setDraft((current) => ({ ...current, banner_url: dataUrl }));
    setStatus("Image loaded. Save profile to keep it.");
  }

  async function saveProfile() {
    if (!user || !draft) return;

    const payload = {
      id: user.id,
      email: user.email,
      display_name: draft.display_name?.trim() || "FlashPortal Player",
      username: cleanUsername(draft.username || user.email?.split("@")[0]),
      bio: draft.bio?.trim() || "",
      avatar_url: draft.avatar_url?.trim() || "",
      banner_url: draft.banner_url?.trim() || "",
      is_private: Boolean(draft.is_private),
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(payload, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      setStatus(`Profile save failed: ${error.message}. Run V71 SQL, then refresh.`);
      return;
    }

    setProfile(data);
    setDraft(data);
    setStatus("Profile saved.");
  }

  async function publishPost() {
    if (!user) return;
    if (!postBody.trim() && !postImage.trim() && !postVideo.trim()) {
      setStatus("Write something, add an image, or add a video first.");
      return;
    }

    const { data, error } = await supabase
      .from("social_posts")
      .insert({
        user_id: user.id,
        body: postBody.trim(),
        image_url: postImage.trim(),
        video_url: postVideo.trim(),
        media_type: postVideo.trim() ? "video" : "image",
        is_private: postAudience === "profile",
        is_deleted: false,
      })
      .select("*")
      .single();

    if (error) {
      setStatus(`Post failed: ${error.message}. Run V71 SQL.`);
      return;
    }

    setPosts((current) => [data, ...current]);
    setPostBody("");
    setPostImage("");
    setPostVideo("");
    try {
      await awardBadge(supabase, user.id, "first_post");
      const { data: badgeData } = await supabase.from("user_badges").select("*").eq("user_id", user.id).order("earned_at", { ascending: false });
      setBadges(badgeData || []);
    } catch {}
    setStatus(postAudience === "community" ? "Post published to your profile and the Community Feed." : "Post published to your profile only.");
  }

  async function togglePostPrivacy(post) {
    const nextPrivate = !Boolean(post.is_private);
    setPosts((current) => current.map((item) => item.id === post.id ? { ...item, is_private: nextPrivate } : item));
    const { error } = await supabase.from("social_posts").update({ is_private: nextPrivate }).eq("id", post.id).eq("user_id", user.id);
    if (error) setStatus(`Post privacy failed: ${error.message}. Run V71 SQL.`);
  }

  async function deletePost(post) {
    if (!window.confirm("Delete this post?")) return;
    setPosts((current) => current.filter((item) => item.id !== post.id));
    const { error } = await supabase.from("social_posts").update({ is_deleted: true }).eq("id", post.id).eq("user_id", user.id);
    if (error) setStatus(`Delete failed: ${error.message}. Run V71 SQL.`);
  }

  async function deleteMyAccount() {
    if (!user) return;
    const confirmed = window.confirm("Delete your FlashPortal account profile? Your login provider account will not be deleted, but your FlashPortal profile will be hidden.");
    if (!confirmed) return;

    setStatus("Deleting account profile...");
    try {
      await supabase.from("social_posts").update({ is_deleted: true }).eq("user_id", user.id);
      await supabase.from("user_profiles").update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        display_name: "Deleted account",
        username: `deleted-${user.id.slice(0, 8)}`,
        bio: "",
        avatar_url: "",
        banner_url: "",
        is_private: true,
      }).eq("id", user.id);
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      setStatus(`Delete failed: ${error.message}. Run V73 SQL.`);
    }
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
          <button type="button" onClick={loginWithGithub}><Github size={16} /> Login with GitHub</button>
        </section>
      </main>
    );
  }

  const shown = profile || profileFromUser(user);

  return (
    <main className="social-home-page">
      <Link className="back-link" href="/"><ArrowLeft size={18} /> Back to FlashPortal</Link>

      <section className="profile-hero-card">
        <div className="profile-banner" style={{ backgroundImage: shown.banner_url ? `linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,.05)), url(${shown.banner_url})` : undefined }} />
        <div className="profile-main-row">
          <div className="profile-avatar">{shown.avatar_url ? <img src={shown.avatar_url} alt="" /> : <UserRound size={48} />}</div>
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
        <p className="editor-help">You can paste an image URL or choose a file from your computer.</p>

        <label>Display name
          <input value={draft?.display_name || ""} onChange={(event) => setDraft({ ...draft, display_name: event.target.value })} />
        </label>

        <label>Username
          <input value={draft?.username || ""} onChange={(event) => setDraft({ ...draft, username: cleanUsername(event.target.value) })} />
        </label>

        <label>Bio
          <textarea value={draft?.bio || ""} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} />
        </label>

        <label>Profile picture
          <input value={draft?.avatar_url || ""} onChange={(event) => setDraft({ ...draft, avatar_url: event.target.value })} placeholder="https://... or choose file below" />
          <input type="file" accept="image/*" onChange={(event) => handleMediaFile("avatar", event.target.files?.[0])} />
        </label>

        <label>Banner image
          <input value={draft?.banner_url || ""} onChange={(event) => setDraft({ ...draft, banner_url: event.target.value })} placeholder="https://... or choose file below" />
          <input type="file" accept="image/*" onChange={(event) => handleMediaFile("banner", event.target.files?.[0])} />
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
          <Link href="/creators">Creators Directory</Link>
          <Link href="/about">About / Roadmap</Link>

          <h3>Your badges</h3>
          <div className="badge-stack">
            {badges.length ? badges.map((row) => {
              const badge = badgeInfo(row.badge_code);
              return <span className={`profile-badge rarity-${badge.rarity.toLowerCase()}`} key={row.badge_code}>⭐ {badge.label}<small>{badge.rarity}</small></span>;
            }) : <p className="editor-help">Earn badges by rating, posting, uploading, and growing followers.</p>}
          </div>

          <h3>Security</h3>
          <button type="button" className="profile-edit-button mini" onClick={sendPasswordReset}><Lock size={15} /> Change password</button>
          <button type="button" className="profile-edit-button mini" onClick={loginWithGithub}><Github size={15} /> Connect GitHub</button>
          <button type="button" className="profile-edit-button mini danger" onClick={deleteMyAccount}><AlertTriangle size={15} /> Delete my account</button>
          <p className="editor-help">2FA is controlled in Supabase Auth settings; we can add the in-site setup page next.</p>
        </aside>

        <section className="social-feed-column">
          <article className="post-composer">
            <h2>Post an update</h2>
            <textarea value={postBody} onChange={(event) => setPostBody(event.target.value)} placeholder="Share an update, image, patch note, stream note..." />
            <div className="post-audience-toggle" role="group" aria-label="Post audience">
              <button type="button" className={postAudience === "community" ? "active" : ""} onClick={() => setPostAudience("community")}>Community Feed + Profile</button>
              <button type="button" className={postAudience === "profile" ? "active" : ""} onClick={() => setPostAudience("profile")}>Profile Only</button>
            </div>
            <input value={postImage || postVideo} onChange={(event) => {
              const value = event.target.value;
              if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(value) || value.startsWith("data:video/")) {
                setPostVideo(value);
                setPostImage("");
              } else {
                setPostImage(value);
                setPostVideo("");
              }
            }} placeholder="Optional image/video URL or choose file below" />
            <label className="file-picker-row compact"><Video size={14} /> Add media
              <input type="file" accept="image/*,video/*" onChange={(event) => handleMediaFile("post", event.target.files?.[0])} />
            </label>
            {postImage && <img className="post-image preview" src={postImage} alt="Post preview" />}
            {postVideo && <video className="post-video preview" src={postVideo} controls playsInline />}
            <button type="button" onClick={publishPost}><Send size={16} /> Post</button>
          </article>

          {posts.map((post) => (
            <article className={`social-post-card ${post.is_private ? "private-post" : ""}`} key={post.id}>
              {post.body && <p>{post.body}</p>}
              {post.image_url && <img className="post-image" src={post.image_url} alt="Post attachment" />}
              {post.video_url && <video className="post-video" src={post.video_url} controls playsInline preload="metadata" />}
              <div className="post-footer-row">
                <span>{new Date(post.created_at).toLocaleDateString()} {post.is_private ? "• Private" : "• Public"}</span>
                <div className="post-owner-actions">
                  <button type="button" onClick={() => togglePostPrivacy(post)}>{post.is_private ? <Globe2 size={15} /> : <EyeOff size={15} />} {post.is_private ? "Make Public" : "Private"}</button>
                  <button type="button" className="danger" onClick={() => deletePost(post)}><Trash2 size={15} /> Delete</button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
