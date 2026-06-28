"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

function safeFileName(name) {
  return String(name || "file").toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-");
}

export default function CreatorUploadPage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ title: "", category: "", description: "", website_url: "" });
  const [thumbnail, setThumbnail] = useState(null);
  const [zip, setZip] = useState(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data?.session?.user || null));
  }, []);

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/creator/upload` },
    });
  }

  async function submit(event) {
    event.preventDefault();

    if (!user) return setStatus("Please log in first. If you are already logged in, refresh this page after login.");
    if (!form.title.trim() || !form.description.trim() || !zip) {
      return setStatus("Game title, description, and ZIP are required. The title and thumbnail do not need to match the ZIP filename. The title and thumbnail do not need to match the ZIP filename.");
    }

    setBusy(true);
    setStatus("Uploading...");

    try {
      const slug = safeFileName(form.title).replace(/\.[^.]+$/, "") || `game-${Date.now()}`;
      const basePath = `${user.id}/${Date.now()}-${slug}`;

      const zipName = `${basePath}/${safeFileName(zip.name)}`;
      const zipUpload = await supabase.storage.from("game-files").upload(zipName, zip, {
        upsert: false,
        contentType: zip.type || "application/zip",
      });
      if (zipUpload.error) throw zipUpload.error;

      let thumbnailPath = null;
      if (thumbnail) {
        const thumbName = `${basePath}/${safeFileName(thumbnail.name)}`;
        const thumbUpload = await supabase.storage.from("game-thumbnails").upload(thumbName, thumbnail, {
          upsert: false,
          contentType: thumbnail.type || "image/png",
        });
        if (thumbUpload.error) throw thumbUpload.error;
        thumbnailPath = thumbUpload.data.path;
      }

      const insert = await supabase.from("game_submissions").insert({
        creator_id: user.id,
          creator_email: user.email || "",
        title: form.title.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        website_url: form.website_url.trim() || null,
        zip_path: zipUpload.data.path,
        thumbnail_path: thumbnailPath,
        status: "pending",
      });

      if (insert.error) {
        if (insert.error.message?.toLowerCase().includes("permission denied")) {
          throw new Error("Permission denied for game_submissions. Run supabase/v46_backend_queue_notifications_reviews_friends.sql in Supabase, then refresh and try again.");
        }
        throw insert.error;
      }

      setStatus("Submitted successfully. Your game is pending review.");
      setForm({ title: "", category: "", description: "", website_url: "" });
      setZip(null);
      setThumbnail(null);
      event.target.reset();
    } catch (error) {
      setStatus(`Upload failed: ${error.message || String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="checkout-page creator-upload-page">
      <Link className="back-link" href="/"><ArrowLeft size={18} /> Back to FlashPortal</Link>

      <section className="checkout-hero">
        <span><Upload size={16} /> Creator Portal</span>
        <h1>Publish Your Game</h1>
        <p>Use any game title and any thumbnail. They do not need to match your ZIP filename.</p>
      </section>

      {!user ? (
        <section className="checkout-note">
          <AlertTriangle size={24} />
          <div>
            <h3>Login required</h3>
            <p>You need to log in before submitting a game.</p>
            <button type="button" onClick={signIn}>Login with Google</button>
          </div>
        </section>
      ) : (
        <form className="upload-form" onSubmit={submit}>
          <label>Game title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="My Awesome Game" /></label>
          <label>Category<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Arcade, Word, Strategy..." /></label>
          <label className="wide">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell players what your game is about." /></label>
          <label className="wide">Website / playable link optional<input value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="https://example.com" /></label>
          <label>Thumbnail image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" onChange={(e) => setThumbnail(e.target.files?.[0] || null)} /></label>
          <label>Game ZIP<input type="file" accept=".zip,application/zip" onChange={(e) => setZip(e.target.files?.[0] || null)} /></label>
          <button type="submit" disabled={busy}><CheckCircle2 size={18} /> {busy ? "Submitting..." : "Submit for Review"}</button>
          {status && <p className="upload-status">{status}</p>}
        </form>
      )}
    </main>
  );
}
