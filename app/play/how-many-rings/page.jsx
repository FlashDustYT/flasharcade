"use client";

import Link from "next/link";
import { ArrowLeft, Maximize2, Save } from "lucide-react";

export default function GamePage() {
  return (
    <main className="game-player-page">
      <header className="game-player-header">
        <Link href="/" className="back-link"><ArrowLeft size={18} /> Back to FlashPortal</Link>
        <div>
          <span>Now Playing</span>
          <h1>How Many Rings?</h1>
          <p>10-Year Title Window</p>
        </div>
        <button type="button" className="secondary-link-button" onClick={() => document.querySelector(".game-frame-shell")?.requestFullscreen?.()}>
          Fullscreen <Maximize2 size={16} />
        </button>
      </header>

      <section className="game-frame-shell playable-demo rings">
        <div className="demo-game-ui">
          <div className="demo-game-top">
            <div>
              <strong>How Many Rings?</strong>
              <small>10-Year Title Window</small>
            </div>
            <span>FlashPortal Cloud Ready</span>
          </div>

          <div className="demo-game-body">
            <h2>Build your dynasty</h2>
            <p>This launcher is working. The original game can be wired here once the exported game files are placed in public/games/how-many-rings/.</p>
            <button type="button" onClick={() => alert("Game save slot created locally. Full in-game save API comes next.")}>
              <Save size={18} /> Test Save
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
