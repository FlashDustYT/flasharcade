"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

const MAX_ZIP_SIZE_MB = 50;
const MAX_THUMBNAIL_SIZE_MB = 8;

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 70);
}

function getFileExt(file) {
  return file?.name?.split(".").pop()?.toLowerCase() || "";
}

function formatBytes(bytes) {
  if (!bytes) return "0 MB";
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function CreatorUploadPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    websiteUrl: "",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [uploading, setUploading] = useState(false);

  const previewUrl = useMemo(() => {
    if (!thumbnail) return "";
    return URL.createObjectURL(thumbnail);
  }, [thumbnail]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validateForm(user) {
    if (!user) return "You need to sign in before submitting a game.";
    if (!form.title.trim()) return "Add a game title.";
    if (!form.description.trim()) return "Add a short description.";
    if (!form.category.trim()) return "Add a category.";
    if (!zipFile) return "Upload a ZIP file for your game.";
    if (getFileExt(zipFile) !== "zip") return "Your game file must be a .zip file.";
    if (zipFile.size > MAX_ZIP_SIZE_MB * 1024 * 1024) {
      return `Your ZIP is ${formatBytes(zipFile.size)}. The current limit is ${MAX_ZIP_SIZE_MB} MB.`;
    }
    if (thumbnail) {
      const ext = getFileExt(thumbnail);
      if (!["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
        return "Thumbnail must be an image file.";
      }
      if (thumbnail.size > MAX_THUMBNAIL_SIZE_MB * 1024 * 1024) {
        return `Your thumbnail is ${formatBytes(thumbnail.size)}. The current limit is ${MAX_THUMBNAIL_SIZE_MB} MB.`;
      }
    }
    return "";
  }

  async function uploadFile(bucket, path, file) {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function submitGame(event) {
    event.preventDefault();
    setStatus({ type: "idle", message: "" });
    setUploading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      const validationError = validateForm(user);

      if (validationError) {
        setStatus({ type: "error", message: validationError });
        setUploading(false);
        return;
      }

      const slug = slugify(form.title);
      const stamp = Date.now();
      const basePath = `${user.id}/${slug || "game"}-${stamp}`;

      const zipPath = `${basePath}/game.zip`;
      const zipUrl = await uploadFile("game-files", zipPath, zipFile);

      let thumbnailUrl = "";
      if (thumbnail) {
        const ext = getFileExt(thumbnail);
        const thumbnailPath = `${basePath}/thumbnail.${ext}`;
        thumbnailUrl = await uploadFile("game-thumbnails", thumbnailPath, thumbnail);
      }

      const { error: insertError } = await supabase.from("game_submissions").insert({
        creator_id: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        website_url: form.websiteUrl.trim() || null,
        thumbnail_url: thumbnailUrl || null,
        zip_url: zipUrl,
        status: "pending",
        is_fdc_original: user.email === "isaac.akinola122@gmail.com",
      });

      if (insertError) throw insertError;

      setForm({ title: "", description: "", category: "", websiteUrl: "" });
      setThumbnail(null);
      setZipFile(null);
      setStatus({
        type: "success",
        message: "Submitted for review. Your game is now pending approval.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.message || "Upload failed. Try again.",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="creator-upload-page">
      <section className="creator-upload-shell">
        <div className="upload-hero">
          <span className="pill">Creator Portal</span>
          <h1>Publish Your Game</h1>
          <p>
            Your first game submission is free. Uploads go into a pending review queue before
            they appear on FlashPortal.
          </p>
        </div>

        <form className="upload-form" onSubmit={submitGame}>
          <label>
            <span>Game title</span>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Legacy League"
              maxLength={80}
            />
          </label>

          <label>
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Tell players what your game is about."
              rows={5}
              maxLength={500}
            />
          </label>

          <div className="upload-grid">
            <label>
              <span>Category</span>
              <input
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                placeholder="Sports, Horror, Strategy..."
                maxLength={60}
              />
            </label>

            <label>
              <span>Website / playable link optional</span>
              <input
                value={form.websiteUrl}
                onChange={(event) => updateField("websiteUrl", event.target.value)}
                placeholder="https://example.com"
              />
            </label>
          </div>

          <div className="upload-grid">
            <label className="file-box">
              <span>Thumbnail image</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(event) => setThumbnail(event.target.files?.[0] || null)}
              />
              <small>{thumbnail ? `${thumbnail.name} · ${formatBytes(thumbnail.size)}` : "PNG, JPG, WEBP, or GIF"}</small>
            </label>

            <label className="file-box">
              <span>Game ZIP</span>
              <input
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                onChange={(event) => setZipFile(event.target.files?.[0] || null)}
              />
              <small>{zipFile ? `${zipFile.name} · ${formatBytes(zipFile.size)}` : "Must include index.html. Max 50 MB."}</small>
            </label>
          </div>

          {previewUrl && (
            <div className="thumbnail-preview">
              <img src={previewUrl} alt="Thumbnail preview" />
            </div>
          )}

          <div className="submission-checklist">
            <h2>Submission checklist</h2>
            <ul>
              <li>ZIP should contain an <strong>index.html</strong> file.</li>
              <li>Game should run in a browser.</li>
              <li>No malicious scripts, downloads, or redirects.</li>
              <li>Thumbnail should clearly represent the game.</li>
            </ul>
            <p>
              V29 stores the ZIP and creates a pending submission. Automatic ZIP inspection and
              admin approval tools come next.
            </p>
          </div>

          {status.message && (
            <div className={`upload-status ${status.type}`}>
              {status.message}
            </div>
          )}

          <div className="upload-actions">
            <Link href="/creator-checkout" className="checkout-back-link">
              Back
            </Link>
            <button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Submit for Review"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
