"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { DEFAULT_GAME_ACHIEVEMENTS } from "../../../lib/badges";

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
  const [freeUploadCount, setFreeUploadCount] = useState(0);
  const [checkingSlot, setCheckingSlot] = useState(true);
  const [paidUploadSlots, setPaidUploadSlots] = useState(0);
  const [achievements, setAchievements] = useState(DEFAULT_GAME_ACHIEVEMENTS.slice(0, 5));

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();
      const currentUser = data?.session?.user || null;
      setUser(currentUser);
      setPaidUploadSlots(Number(localStorage.getItem("flashportal-paid-upload-slots") || "0"));

      if (!currentUser) {
        setCheckingSlot(false);
        return;
      }

      const { data: submissions } = await supabase
        .from("game_submissions")
        .select("id, status")
        .or(`creator_id.eq.${currentUser.id},creator_email.eq.${currentUser.email}`)
        .in("status", ["pending", "approved"]);

      setFreeUploadCount(Array.isArray(submissions) ? submissions.length : 0);
      setCheckingSlot(false);
    }

    init();
  }, []);

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/creator/upload` },
    });
  }

  function updateAchievement(index, field, value) {
    setAchievements((current) => current.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  function addAchievement() {
    setAchievements((current) => [
      ...current,
      { code: `custom_${Date.now()}`, label: "", title: "", rarity: "Common", description: "", target_type: "custom", target_value: 1 }
    ]);
  }

  function removeAchievement(index) {
    setAchievements((current) => current.filter((_, i) => i !== index));
  }

  async function submit(event) {
    event.preventDefault();

    if (!user) return setStatus("Please log in first. If you are already logged in, refresh this page after login.");
    const freeUploadsUsed = freeUploadCount >= 3;
    const usingPaidSlot = freeUploadsUsed && paidUploadSlots > 0;
    if (freeUploadsUsed && !usingPaidSlot) return setStatus("Your 3 free uploads have already been used or are pending review. Use the paid Extra Upload option before submitting another game.");
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
      }).select("id, title").single();

      if (insert.error) {
        if (insert.error.message?.toLowerCase().includes("permission denied")) {
          throw new Error("Permission denied for game_submissions. Run supabase/v47_reviews_upload_audio_fix.sql in Supabase, then refresh and try again.");
        }
        throw insert.error;
      }

      const gameIdForAchievements = insert.data?.id || slug;
      const achievementRows = achievements
        .filter((item) => String(item.label || item.title || "").trim())
        .map((item) => ({
          game_id: String(gameIdForAchievements),
          creator_id: user.id,
          title: String(item.label || item.title || "").trim(),
          description: String(item.description || "").trim(),
          rarity: item.rarity || "Common",
          requirement_type: item.target_type || item.requirement_type || "custom",
          requirement_value: Number(item.target_value || item.requirement_value || 1),
          is_active: true,
        }));

      if (achievementRows.length) {
        await supabase.from("game_achievements").insert(achievementRows);
      }

      if (usingPaidSlot) {
        const nextSlots = Math.max(0, paidUploadSlots - 1);
        setPaidUploadSlots(nextSlots);
        localStorage.setItem("flashportal-paid-upload-slots", String(nextSlots));
      }
      setFreeUploadCount((current) => current + 1);
      setStatus(usingPaidSlot ? "Submitted successfully using your paid upload slot. Your game is pending review." : `Submitted successfully. Your game is pending review. Free uploads used: ${Math.min(3, freeUploadCount + 1)}/3.`);
      setForm({ title: "", category: "", description: "", website_url: "" });
      setZip(null);
      setThumbnail(null);
      setAchievements(DEFAULT_GAME_ACHIEVEMENTS.slice(0, 5));
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
        <p>You can submit up to 3 games for free. Use any game title and any thumbnail; they do not need to match your ZIP filename.</p>
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
      ) : freeUploadCount >= 3 && paidUploadSlots <= 0 ? (
        <section className="checkout-note">
          <AlertTriangle size={24} />
          <div>
            <h3>Free uploads used</h3>
            <p>Your 3 free game uploads are already pending or approved. Use the paid Extra Upload option to submit another game.</p>
            <Link className="primary-link-button" href="/creator-checkout">View Paid Options</Link>
          </div>
        </section>
      ) : (
        <form className="upload-form" onSubmit={submit}>
          {freeUploadCount < 3 && <p className="upload-status">Free uploads used: {freeUploadCount}/3</p>}
          {freeUploadCount >= 3 && paidUploadSlots > 0 && <p className="upload-status">Paid extra upload slot available: {paidUploadSlots}</p>}
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
