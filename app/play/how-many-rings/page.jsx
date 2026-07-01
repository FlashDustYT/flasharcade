"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Maximize2 } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

const game = {
  title: "How Many Rings?",
  subtitle: "10-Year Title Window",
  src: "/games/how-many-rings/index.html",
};

export default function GamePage() {
  const [status, setStatus] = useState("");
  const awarded = useRef(new Set());

  function fullscreen() {
    document.querySelector(".game-frame-shell")?.requestFullscreen?.();
  }

  async function award(code) {
    if (!code || awarded.current.has(code)) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;
    const { error } = await supabase.rpc("fp_award_badge", { badge_code: code });
    if (!error) {
      awarded.current.add(code);
      setStatus("Achievement synced.");
    } else {
      setStatus(`Achievement sync failed: ${error.message}`);
    }
  }

  function syncLocalBest() {
    try {
      const keys = ["howManyRingsBest", "how_many_rings_best", "hmrBest", "ringsBest"];
      const found = keys.map((key) => {
        try { return JSON.parse(window.localStorage.getItem(key) || "null"); } catch { return null; }
      }).find(Boolean);
      const best = found || null;
      if (!best) return;
      const rings = Number(best.rings ?? best.bestRings ?? best.record ?? best.score ?? 0);
      award("how_many_rings_first_run");
      if (rings >= 3) award("how_many_rings_dynasty");
      if (rings >= 10) award("how_many_rings_perfect_decade");
    } catch {}
  }

  useEffect(() => {
    syncLocalBest();
    const interval = window.setInterval(syncLocalBest, 2500);
    function onMessage(event) {
      if (event.origin !== window.location.origin) return;
      const payload = event.data || {};
      if (payload.type !== "flashportal-game-achievement") return;
      if (payload.gameId === "how-many-rings") {
        award("how_many_rings_first_run");
        if (Number(payload.rings || 0) >= 3) award("how_many_rings_dynasty");
        if (Number(payload.rings || 0) >= 10) award("how_many_rings_perfect_decade");
      }
    }
    window.addEventListener("message", onMessage);
    window.addEventListener("focus", syncLocalBest);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("message", onMessage);
      window.removeEventListener("focus", syncLocalBest);
    };
  }, []);

  return (
    <main className="game-player-page">
      <header className="game-player-header">
        <Link href="/" className="back-link"><ArrowLeft size={18} /> Back to FlashPortal</Link>
        <div>
          <span>Now Playing</span>
          <h1>{game.title}</h1>
          <p>{game.subtitle}</p>
          {status && <p className="hub-status">{status}</p>}
        </div>
        <button type="button" className="secondary-link-button" onClick={fullscreen}>
          Fullscreen <Maximize2 size={16} />
        </button>
      </header>

      <section className="game-frame-shell real-game-shell">
        <iframe title={game.title} src={game.src} className="game-frame" allow="fullscreen; gamepad; autoplay; clipboard-read; clipboard-write" />
      </section>
    </main>
  );
}
