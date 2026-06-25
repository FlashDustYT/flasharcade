"use client";

import { useMemo, useState } from "react";
import { Search, Play, Star, Trophy, Flame, Gamepad2, Sparkles, ExternalLink, Clock, Filter, Dice5, Home } from "lucide-react";

const MAIN_SITE = "https://flashdust.dev";

const games = [
  {
    id: "how-many-rings",
    title: "How Many Rings?",
    subtitle: "Build the perfect dynasty and see how many rings your team can win.",
    genre: "Sports Strategy",
    status: "Playable",
    rating: 4.8,
    plays: "New",
    tag: "Featured",
    image: "rings",
    url: "https://flashdustyt.github.io/perfect-season-pro/how-many-rings-source-code/",
    accent: "gold",
  },
  {
    id: "lucky-dust-roll",
    title: "Lucky Dust Roll",
    subtitle: "Roll the daily number, chase the target, and earn bragging rights.",
    genre: "Daily Challenge",
    status: "On Main Site",
    rating: 4.6,
    plays: "Daily",
    tag: "Daily",
    image: "dice",
    url: "https://flashdust.dev",
    accent: "purple",
  },
  {
    id: "escape-the-basement",
    title: "Escape The Basement",
    subtitle: "A horror concept slot reserved for your first spooky browser game.",
    genre: "Horror",
    status: "Coming Soon",
    rating: null,
    plays: "Soon",
    tag: "Coming Soon",
    image: "horror",
    url: "#",
    accent: "red",
  },
  {
    id: "guess-the-youtuber",
    title: "Guess The YouTuber",
    subtitle: "A party trivia game built for streams, chat chaos, and viewer guesses.",
    genre: "Party Trivia",
    status: "Concept",
    rating: null,
    plays: "Soon",
    tag: "Concept",
    image: "quiz",
    url: "#",
    accent: "blue",
  },
  {
    id: "horror-roulette",
    title: "Horror Roulette",
    subtitle: "Spin the wheel and survive whatever nightmare it throws at you.",
    genre: "Horror Party",
    status: "Concept",
    rating: null,
    plays: "Soon",
    tag: "Concept",
    image: "roulette",
    url: "#",
    accent: "green",
  },
];

const categories = ["All", "Playable", "Sports Strategy", "Daily Challenge", "Horror", "Party Trivia", "Concept"];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const featured = games[0];

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const q = query.toLowerCase();
      const matchesQuery = game.title.toLowerCase().includes(q) || game.subtitle.toLowerCase().includes(q) || game.genre.toLowerCase().includes(q);
      const matchesCategory = category === "All" || game.genre === category || game.status === category || game.tag === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  function randomGame() {
    const playable = games.filter((game) => game.url !== "#");
    const game = playable[Math.floor(Math.random() * playable.length)];
    if (game?.url) window.open(game.url, "_blank", "noopener,noreferrer");
  }

  return (
    <main>
      <div className="bg-grid" />
      <div className="bg-orbit one" />
      <div className="bg-orbit two" />

      <section className="shell">
        <header className="nav">
          <a href="#" className="brand"><span className="brand-mark">FA</span><span>Flash<span>Arcade</span></span></a>
          <nav>
            <a href="#library">Library</a>
            <a href="#featured">Featured</a>
            <a href={MAIN_SITE}><Home size={16} /> FlashDust</a>
          </nav>
        </header>

        <section className="hero" id="featured">
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={16} /> FlashDust Games Storefront</div>
            <h1>Your own arcade.<span>Your own universe.</span></h1>
            <p>A PlayStation Store-inspired home for FlashDust games, browser experiments, stream challenges, and future releases.</p>
            <div className="hero-actions">
              <a className="button primary" href={featured.url} target="_blank"><Play size={20} /> Play Featured</a>
              <button className="button secondary" onClick={randomGame}><Dice5 size={20} /> Random Game</button>
            </div>
            <div className="stats">
              <Stat icon={<Gamepad2 />} value={games.length} label="Games & Concepts" />
              <Stat icon={<Trophy />} value="1" label="Playable Now" />
              <Stat icon={<Flame />} value="V1" label="Arcade Build" />
            </div>
          </div>

          <a className="featured-card" href={featured.url} target="_blank">
            <GameArt type={featured.image} />
            <div className="featured-info">
              <span className="pill">{featured.tag}</span>
              <h2>{featured.title}</h2>
              <p>{featured.subtitle}</p>
              <div className="meta-row">
                <span>{featured.genre}</span><span>★ {featured.rating}</span><span>{featured.status}</span>
              </div>
            </div>
          </a>
        </section>

        <section className="toolbar" id="library">
          <div>
            <h2>Game Library</h2>
            <p>Browse every FlashDust game, prototype, and upcoming release.</p>
          </div>
          <div className="search-box">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search games..." />
          </div>
        </section>

        <section className="categories">
          <Filter size={17} />
          {categories.map((item) => (
            <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </section>

        <section className="game-grid">
          {filteredGames.map((game) => <GameCard game={game} key={game.id} />)}
        </section>

        <section className="roadmap">
          <div>
            <span className="pill">Coming Next</span>
            <h2>FlashArcade Roadmap</h2>
            <p>This starts as your personal game storefront. Later it can become a full platform with leaderboards, player accounts, ratings, achievements, and creator-submitted games.</p>
          </div>
          <div className="roadmap-list">
            <RoadmapItem icon={<Trophy />} title="Leaderboards" text="Track high scores and daily challenge winners." />
            <RoadmapItem icon={<Star />} title="Ratings" text="Let players rate games and leave feedback." />
            <RoadmapItem icon={<Clock />} title="Patch Notes" text="Each game can have changelogs and updates." />
          </div>
        </section>

        <footer><span>© {new Date().getFullYear()} FlashArcade by FlashDust.</span><a href={MAIN_SITE}>Back to FlashDust.dev</a></footer>
      </section>
    </main>
  );
}

function GameCard({ game }) {
  const playable = game.url !== "#";
  return (
    <article className={`game-card ${game.accent}`}>
      <GameArt type={game.image} />
      <div className="game-content">
        <div className="game-top">
          <span className="pill">{game.tag}</span>
          {game.rating ? <span className="rating"><Star size={15} fill="currentColor" /> {game.rating}</span> : <span className="rating muted">Soon</span>}
        </div>
        <h3>{game.title}</h3>
        <p>{game.subtitle}</p>
        <div className="game-meta"><span>{game.genre}</span><span>{game.plays}</span></div>
        {playable ? <a className="play-link" href={game.url} target="_blank">Play Now <ExternalLink size={16} /></a> : <button className="play-link disabled" disabled>Coming Soon</button>}
      </div>
    </article>
  );
}

function GameArt({ type }) {
  return (
    <div className={`game-art ${type}`}>
      <div className="shine" />
      {type === "rings" ? <Trophy size={72} /> : null}
      {type === "dice" ? <Dice5 size={72} /> : null}
      {type === "horror" ? <Flame size={72} /> : null}
      {type === "quiz" ? <Sparkles size={72} /> : null}
      {type === "roulette" ? <Gamepad2 size={72} /> : null}
    </div>
  );
}

function Stat({ icon, value, label }) {
  return <div className="stat">{icon}<div><strong>{value}</strong><span>{label}</span></div></div>;
}

function RoadmapItem({ icon, title, text }) {
  return <div className="roadmap-item">{icon}<div><h3>{title}</h3><p>{text}</p></div></div>;
}
