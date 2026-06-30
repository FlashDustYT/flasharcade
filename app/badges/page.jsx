import { BADGE_DEFINITIONS, DEFAULT_GAME_ACHIEVEMENTS } from "../../lib/badges";

export default function BadgesPage() {
  const platformBadges = Array.isArray(BADGE_DEFINITIONS) ? BADGE_DEFINITIONS : [];
  const gameAchievements = Array.isArray(DEFAULT_GAME_ACHIEVEMENTS) ? DEFAULT_GAME_ACHIEVEMENTS : [];

  return (
    <main className="page-stack">
      <section className="hero-panel">
        <p className="eyebrow">ACHIEVEMENTS</p>
        <h1>Badge Guide</h1>
        <p className="muted">See available platform badges and game achievement examples.</p>
      </section>

      <section className="glass-card">
        <h2>Platform Badges</h2>
        <div className="card-grid">
          {platformBadges.map((badge) => (
            <article className="mini-card" key={badge.code}>
              <h3>{badge.label || badge.title}</h3>
              <p className="muted">{badge.rarity}</p>
              <p>{badge.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-card">
        <h2>Game Achievement Examples</h2>
        <div className="card-grid">
          {gameAchievements.map((badge) => (
            <article className="mini-card" key={badge.code}>
              <h3>{badge.label || badge.title}</h3>
              <p className="muted">{badge.rarity}</p>
              <p>{badge.description || badge.unlock_hint}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
