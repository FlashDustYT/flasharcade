"use client";

import Link from "next/link";
import { ArrowLeft, Maximize2 } from "lucide-react";

const game = {
  title: "Guess the Word!",
  subtitle: "Emoji Word Puzzle",
  src: "/games/guess-the-word/index.html",
};

export default function GamePage() {
  function fullscreen() {
    document.querySelector(".game-frame-shell")?.requestFullscreen?.();
  }

  return (
    <main className="game-player-page">
      <header className="game-player-header">
        <Link href="/" className="back-link"><ArrowLeft size={18} /> Back to FlashPortal</Link>
        <div>
          <span>Now Playing</span>
          <h1>{game.title}</h1>
          <p>{game.subtitle}</p>
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
