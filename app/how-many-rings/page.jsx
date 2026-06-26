"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

const GAME_URL = "https://flashdustyt.github.io/perfect-season-pro/how-many-rings-source-code/";

export default function HowManyRingsPage() {
  return (
    <main className="game-player-page">
      <header className="game-player-header">
        <Link href="/" className="back-link">
          <ArrowLeft size={18} />
          Back to FlashPortal
        </Link>

        <div>
          <span className="pill">Now Playing</span>
          <h1>How Many Rings?</h1>
        </div>

        <a className="open-external" href={GAME_URL} target="_blank" rel="noopener noreferrer">
          Open Original <ExternalLink size={17} />
        </a>
      </header>

      <section className="game-frame-wrap">
        <iframe
          title="How Many Rings?"
          src={GAME_URL}
          className="game-frame"
          allow="fullscreen; autoplay; clipboard-write"
        />
      </section>
    </main>
  );
}
