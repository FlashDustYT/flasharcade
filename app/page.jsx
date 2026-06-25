"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Play,
  Star,
  Trophy,
  Flame,
  Gamepad2,
  Sparkles,
  ExternalLink,
  Clock,
  Filter,
  Dice5,
  Home,
  User,
  LogIn,
  PlusCircle,
  Lock,
  Medal,
  Crown,
  Volume2,
  VolumeX,
  Music,
  Music2,
} from "lucide-react";

const MAIN_SITE = "https://flashdust.dev";

const games = [
  {
    id: "how-many-rings",
    title: "How Many Rings?",
    subtitle: "Build the perfect dynasty and see how many rings your team can win.",
    genre: "Sports Strategy",
    status: "Playable",
    rating: 4.8,
    plays: "Playable",
    tag: "Featured",
    image: "rings",
    url: "https://flashdustyt.github.io/perfect-season-pro/how-many-rings-source-code/",
    accent: "gold",
    playable: true,
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
    playable: false,
  },
  {
    id: "guess-the-youtuber",
    title: "Guess The YouTuber",
    subtitle: "A party trivia game built for streams, chat chaos, and viewer guesses.",
    genre: "Party Trivia",
    status: "Coming Soon",
    rating: null,
    plays: "Soon",
    tag: "Coming Soon",
    image: "quiz",
    url: "#",
    accent: "blue",
    playable: false,
  },
  {
    id: "horror-roulette",
    title: "Horror Roulette",
    subtitle: "Spin the wheel and survive whatever nightmare it throws at you.",
    genre: "Horror Party",
    status: "Coming Soon",
    rating: null,
    plays: "Soon",
    tag: "Coming Soon",
    image: "roulette",
    url: "#",
    accent: "green",
    playable: false,
  },
];

const leaderboard = [
  { rank: 1, name: "FlashDust", game: "How Many Rings?", score: "12 Rings", detail: "Dynasty God" },
  { rank: 2, name: "Guest Player", game: "How Many Rings?", score: "9 Rings", detail: "Finals Merchant" },
  { rank: 3, name: "Arcade Rookie", game: "How Many Rings?", score: "6 Rings", detail: "Respectable Run" },
  { rank: 4, name: "Bench Legend", game: "How Many Rings?", score: "4 Rings", detail: "Still better than most" },
];

const categories = ["All", "Playable", "Sports Strategy", "Coming Soon", "Horror", "Party Trivia", "Concept"];

function playClickSound(enabled) {
  if (!enabled || typeof window === "undefined") return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(760, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.055);

    gain.gain.setValueAtTime(0.035, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.075);
  } catch {}
}

function createArcadeAmbience() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContext();

  const master = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  master.gain.value = 0.045;
  filter.type = "lowpass";
  filter.frequency.value = 1200;

  filter.connect(master);
  master.connect(ctx.destination);

  const bass = ctx.createOscillator();
  const bassGain = ctx.createGain();
  bass.type = "triangle";
  bass.frequency.value = 55;
  bassGain.gain.value = 0.055;
  bass.connect(bassGain);
  bassGain.connect(filter);

  const pad = ctx.createOscillator();
  const padGain = ctx.createGain();
  pad.type = "sine";
  pad.frequency.value = 220;
  padGain.gain.value = 0.028;
  pad.connect(padGain);
  padGain.connect(filter);

  const pulse = ctx.createOscillator();
  const pulseGain = ctx.createGain();
  pulse.type = "square";
  pulse.frequency.value = 110;
  pulseGain.gain.value = 0.012;
  pulse.connect(pulseGain);
  pulseGain.connect(filter);

  bass.start();
  pad.start();
  pulse.start();

  const notes = [55, 65.41, 73.42, 82.41, 98, 110];
  let step = 0;

  const interval = setInterval(() => {
    const now = ctx.currentTime;
    const note = notes[step % notes.length];
    bass.frequency.exponentialRampToValueAtTime(note, now + 0.25);
    pad.frequency.exponentialRampToValueAtTime(note * 4, now + 0.4);

    pulseGain.gain.setValueAtTime(0.02, now);
    pulseGain.gain.exponentialRampToValueAtTime(0.004, now + 0.16);

    step += 1;
  }, 700);

  return {
    stop() {
      clearInterval(interval);
      const now = ctx.currentTime;
      master.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      setTimeout(() => {
        bass.stop();
        pad.stop();
        pulse.stop();
        ctx.close();
      }, 450);
    },
  };
}


export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [loginOpen, setLoginOpen] = useState(false);
  const [clickSoundOn, setClickSoundOn] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const musicRef = useRef(null);
  const featured = games[0];


  useEffect(() => {
    const handler = (event) => {
      if (event.target.closest("button, a")) {
        playClickSound(clickSoundOn);
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [clickSoundOn]);

  useEffect(() => {
    if (musicOn && !musicRef.current) {
      musicRef.current = createArcadeAmbience();
    }

    if (!musicOn && musicRef.current) {
      musicRef.current.stop();
      musicRef.current = null;
    }

    return () => {
      if (musicRef.current) {
        musicRef.current.stop();
        musicRef.current = null;
      }
    };
  }, [musicOn]);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const q = query.toLowerCase();
      const matchesQuery =
        game.title.toLowerCase().includes(q) ||
        game.subtitle.toLowerCase().includes(q) ||
        game.genre.toLowerCase().includes(q);

      const matchesCategory =
        category === "All" ||
        game.genre === category ||
        game.status === category ||
        game.tag === category;

      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  function randomGame() {
    window.open(featured.url, "_blank", "noopener,noreferrer");
  }

  return (
    <main>
      <div className="bg-grid" />
      <div className="bg-orbit one" />
      <div className="bg-orbit two" />

      {loginOpen && (
        <section className="modal-backdrop" onClick={() => setLoginOpen(false)}>
          <div className="login-modal" onClick={(event) => event.stopPropagation()}>
            <button className="close" onClick={() => setLoginOpen(false)}>×</button>
            <div className="modal-icon"><User size={30} /></div>
            <h2>FlashArcade Login</h2>
            <p>Player accounts are coming soon. Later, this will save scores, achievements, favorites, and leaderboard names.</p>
            <input placeholder="Username" disabled />
            <input placeholder="Password" type="password" disabled />
            <button disabled>Login Coming Soon</button>
          </div>
        </section>
      )}

      <section className="shell">
        <header className="nav">
          <a href="#" className="brand">
            <span className="brand-mark">FA</span>
            <span>Flash<span>Arcade</span></span>
          </a>

          <nav>
            <a href="#library">Library</a>
            <a href="#leaderboard">Leaderboard</a>
            <a href={MAIN_SITE}><Home size={16} /> FlashDust</a>
            <button className="login-button audio-button" onClick={() => setClickSoundOn((value) => !value)} title="Toggle click sound">
              {clickSoundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button className="login-button audio-button" onClick={() => setMusicOn((value) => !value)} title="Toggle arcade background music">
              {musicOn ? <Music2 size={16} /> : <Music size={16} />}
            </button>
            <button className="login-button" onClick={() => setLoginOpen(true)}>
              <LogIn size={16} /> Login
            </button>
          </nav>
        </header>

        <section className="hero" id="featured">
          <div className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={16} />
              FlashDust Games Storefront
            </div>

            <h1>
              Your own arcade.
              <span>Your own universe.</span>
            </h1>

            <p>
              A PlayStation Store-inspired home for FlashDust games, browser experiments,
              stream challenges, and future releases.
            </p>

            <div className="hero-actions">
              <a className="button primary" href={featured.url} target="_blank">
                <Play size={20} /> Play Featured
              </a>
              <button className="button secondary" onClick={randomGame}>
                <Dice5 size={20} /> Random Playable Game
              </button>
            </div>

            <div className="stats">
              <Stat icon={<Gamepad2 />} value="1" label="Playable Game" />
              <Stat icon={<Trophy />} value="Live" label="Leaderboard" />
              <Stat icon={<Flame />} value="V2" label="Arcade Build" />
            </div>
          </div>

          <a className="featured-card" href={featured.url} target="_blank">
            <GameArt type={featured.image} />
            <div className="featured-info">
              <span className="pill">{featured.tag}</span>
              <h2>{featured.title}</h2>
              <p>{featured.subtitle}</p>
              <div className="meta-row">
                <span>{featured.genre}</span>
                <span>★ {featured.rating}</span>
                <span>{featured.status}</span>
              </div>
            </div>
          </a>
        </section>

        <section className="toolbar" id="library">
          <div>
            <h2>Game Library</h2>
            <p>Only How Many Rings? is playable right now. Everything else is marked Coming Soon.</p>
          </div>

          <div className="search-box">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search games..."
            />
          </div>
        </section>

        <section className="categories">
          <Filter size={17} />
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </section>

        <section className="game-grid">
          {filteredGames.map((game) => (
            <GameCard game={game} key={game.id} />
          ))}

          <article className="game-card submit-card">
            <div className="submit-lock">
              <PlusCircle size={76} />
              <Lock size={28} className="lock" />
            </div>
            <div className="game-content">
              <span className="pill">Creator Tools</span>
              <h3>Add Your Own Game</h3>
              <p>Upload your own web game to FlashArcade and get a store page.</p>
              <button className="play-link disabled" disabled>Coming Soon</button>
            </div>
            <div className="hover-message">Coming Soon</div>
          </article>
        </section>

        <section className="leaderboard" id="leaderboard">
          <div className="leaderboard-head">
            <div>
              <span className="pill">Live Board</span>
              <h2>FlashArcade Leaderboard</h2>
              <p>This is wired as a working live-style leaderboard section. Scores are currently sample data until we connect real game submissions.</p>
            </div>
            <Medal size={54} />
          </div>

          <div className="leaderboard-list">
            {leaderboard.map((player) => (
              <div className={`leader-row rank-${player.rank}`} key={player.rank}>
                <div className="rank">
                  {player.rank === 1 ? <Crown size={22} /> : player.rank}
                </div>
                <div className="player">
                  <strong>{player.name}</strong>
                  <span>{player.game} • {player.detail}</span>
                </div>
                <div className="score">{player.score}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="roadmap">
          <div>
            <span className="pill">Coming Next</span>
            <h2>FlashArcade Roadmap</h2>
            <p>
              This starts as your personal game storefront. Later it can become a full platform
              with player accounts, real score submissions, achievements, and creator-uploaded games.
            </p>
          </div>

          <div className="roadmap-list">
            <RoadmapItem icon={<Trophy />} title="Real Score Saving" text="Connect games to submit scores automatically." />
            <RoadmapItem icon={<Star />} title="Ratings" text="Let players rate games and leave feedback." />
            <RoadmapItem icon={<Clock />} title="Patch Notes" text="Each game can have changelogs and updates." />
          </div>
        </section>

        <footer>
          <span>© {new Date().getFullYear()} FlashArcade by FlashDust.</span>
          <a href={MAIN_SITE}>Back to FlashDust.dev</a>
        </footer>
      </section>
    </main>
  );
}

function GameCard({ game }) {
  return (
    <article className={`game-card ${game.accent}`}>
      <GameArt type={game.image} />

      <div className="game-content">
        <div className="game-top">
          <span className="pill">{game.tag}</span>
          {game.rating ? (
            <span className="rating">
              <Star size={15} fill="currentColor" /> {game.rating}
            </span>
          ) : (
            <span className="rating muted">Soon</span>
          )}
        </div>

        <h3>{game.title}</h3>
        <p>{game.subtitle}</p>

        <div className="game-meta">
          <span>{game.genre}</span>
          <span>{game.plays}</span>
        </div>

        {game.playable ? (
          <a className="play-link" href={game.url} target="_blank">
            Play Now <ExternalLink size={16} />
          </a>
        ) : (
          <button className="play-link disabled" disabled>
            Coming Soon
          </button>
        )}
      </div>
    </article>
  );
}

function GameArt({ type }) {
  return (
    <div className={`game-art ${type}`}>
      <div className="shine" />
      {type === "rings" ? <Trophy size={72} /> : null}
      {type === "horror" ? <Flame size={72} /> : null}
      {type === "quiz" ? <Sparkles size={72} /> : null}
      {type === "roulette" ? <Gamepad2 size={72} /> : null}
    </div>
  );
}

function Stat({ icon, value, label }) {
  return (
    <div className="stat">
      {icon}
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function RoadmapItem({ icon, title, text }) {
  return (
    <div className="roadmap-item">
      {icon}
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}
