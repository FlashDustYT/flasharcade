"use client";

import Link from "next/link";
import { Maximize2, ArrowLeft } from "lucide-react";

const game = {
  title: "How Many Rings?",
  src: "/games/how-many-rings/index.html",
};

export default function GamePage() {
  return (
    <main className="game-player-page">
      <header className="game-player-header">
        <Link href="/" className="back-link"><ArrowLeft size={18} /> Back to FlashPortal</Link>
        <div>
          <span>Now Playing</span>
          <h1>{game.title}</h1>
        </div>
        <a href={game.src} target="_blank" rel="noreferrer" className="secondary-link-button">
          Open Fullscreen <Maximize2 size={16} />
        </a>
      </header>

      <section className="game-frame-shell">
        <iframe
          title={game.title}
          src={game.src}
          className="game-frame"
          allow="fullscreen; gamepad; autoplay"
        />
      </section>
    </main>
  );
}
