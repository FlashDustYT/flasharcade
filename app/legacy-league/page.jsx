"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

const GAME_URL = "/games/legacy-league/index.html";

export default function LegacyLeaguePage() {
  return (
    <main className="game-player-page">
      <header className="game-player-header">
        <Link href="/" className="back-link">
          <ArrowLeft size={18} />
          Back to FlashPortal
        </Link>

        <div>
          <span className="pill">Now Playing</span>
          <h1>Legacy League</h1>
        </div>

        <a className="open-external" href={GAME_URL} target="_blank" rel="noopener noreferrer">
          Open Fullscreen <ExternalLink size={17} />
        </a>
      </header>

      <section className="game-frame-wrap">
        <iframe
          title="Legacy League"
          src={GAME_URL}
          className="game-frame"
          allow="fullscreen; autoplay; clipboard-write"
        />
      </section>
    </main>
  );
}
