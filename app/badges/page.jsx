"use client";

import Link from "next/link";
import { ArrowLeft, BadgeCheck, Gamepad2, Sparkles, Trophy } from "lucide-react";
import { BADGE_DEFINITIONS, DEFAULT_GAME_ACHIEVEMENTS } from "../../lib/badges";

const RARITY_ORDER = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];

export default function BadgesPage() {
  const grouped = RARITY_ORDER.map((rarity) => ({
    rarity,
    badges: BADGE_DEFINITIONS.filter((badge) => badge.rarity === rarity),
  }));

  return (
    <main className="checkout-page badges-page">
      <Link href="/" className="back-link"><ArrowLeft size={18} /> Back to FlashPortal</Link>

      <section className="checkout-hero compact-hero">
        <div>
          <p className="eyebrow"><Trophy size={18} /> FlashPortal Badges</p>
          <h1>Badges & Achievements</h1>
          <p>See what you can earn, from simple profile badges to rare creator milestones. Game creators can also add custom achievements during upload.</p>
        </div>
      </section>

      <section className="badge-guide-grid">
        {grouped.map((group) => (
          <article className={`badge-guide-panel rarity-${group.rarity.toLowerCase()}`} key={group.rarity}>
            <h2>{group.rarity}</h2>
            <div className="badge-guide-list">
              {group.badges.map((badge) => (
                <div className="badge-guide-item" key={badge.code}>
                  <span><BadgeCheck size={16} /> {badge.label}</span>
                  <p>{badge.description}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="badge-guide-panel game-achievement-panel">
        <h2><Gamepad2 size={22} /> Game achievement examples</h2>
        <p className="editor-help">Creators can keep these defaults or make their own when submitting a game.</p>
        <div className="badge-guide-list two-col">
          {DEFAULT_GAME_ACHIEVEMENTS.map((badge) => (
            <div className="badge-guide-item" key={badge.code}>
              <span><Sparkles size={16} /> {badge.label} <small>{badge.rarity}</small></span>
              <p>{badge.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
