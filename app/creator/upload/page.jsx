"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

function safeFileName(name) {
  return name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-");
}

export default function CreatorUploadPage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    website_url: "",
  });
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

    if (!user) {
      setStatus("Please log in first.");
      return;
    }

    if (!form.title || !form.description || !zip) {
      setStatus("Game title, description, and ZIP are required.");
      return;
    }

    setBusy(true);
    setStatus("Uploading...");

    try {
      const slug = safeFileName(form.title).replace(/\.[^.]+$/, "") || `game-${Date.now()}`;
      const basePath = `${user.id}/${Date.now()}-${slug}`;

      let zipPath = null;
      let thumbnailPath = null;

      const zipName = `${basePath}/${safeFileName(zip.name)}`;
      const zipUpload = await supabase.storage.from("game-files").upload(zipName, zip, {
        upsert: false,
        contentType: zip.type || "application/zip",
      });

      if (zipUpload.error) throw zipUpload.error;
      zipPath = zipUpload.data.path;

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
        title: form.title,
        category: form.category,
        description: form.description,
        website_url: form.website_url,
        zip_path: zipPath,
        thumbnail_path: thumbnailPath,
        status: "pending",
      });

      if (insert.error) throw insert.error;

      setStatus("Submitted successfully. Your game is now pending review.");
      setForm({ title: "", category: "", description: "", website_url: "" });
      setZip(null);
      setThumbnail(null);
    } catch (error) {
      setStatus(`Upload failed: ${error.message || String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="checkout-page creator-upload-page">
      <Link className="back-link" href="/">
        <ArrowLeft size={18} /> Back to FlashPortal
      </Link>

      <section className="checkout-hero">
        <span><Upload size={16} /> Creator Portal</span>
        <h1>Publish Your Game</h1>
        <p>Your first game submission is free. Uploads go into a pending review queue before they appear on FlashPortal.</p>
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
          <label>
            Game title
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Legacy League" />
          </label>

          <label>
            Category
            <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Sports, Horror, Strategy..." />
          </label>

          <label className="wide">
            Description
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Tell players what your game is about." />
          </label>

          <label className="wide">
            Website / playable link optional
            <input value={form.website_url} onChange={(event) => setForm({ ...form, website_url: event.target.value })} placeholder="https://example.com" />
          </label>

          <label>
            Thumbnail image
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => setThumbnail(event.target.files?.[0] || null)} />
          </label>

          <label>
            Game ZIP
            <input type="file" accept=".zip,application/zip" onChange={(event) => setZip(event.target.files?.[0] || null)} />
          </label>

          <button type="submit" disabled={busy}>
            <CheckCircle2 size={18} /> {busy ? "Submitting..." : "Submit for Review"}
          </button>

          {status && <p className="upload-status">{status}</p>}
        </form>
      )}
    </main>
  );
}
