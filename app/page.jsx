"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Play,
  Trophy,
  Flame,
  Gamepad2,
  Sparkles,
  ExternalLink,
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
  Star,
} from "lucide-react";

const MAIN_SITE = "https://flashdust.dev";

const games = [
  {
    id: "how-many-rings",
    title: "How Many Rings?",
    subtitle: "Build the perfect dynasty and see how many rings your team can win.",
    genre: "Sports Strategy",
    status: "Playable",
    plays: "Playable",
    tag: "Featured",
    image: "rings",
    url: "https://flashdustyt.github.io/perfect-season-pro/how-many-rings-source-code/",
    accent: "gold",
    playable: true,
  },
  {
    id: "legacy-league",
    title: "Legacy League",
    subtitle: "A future sports universe from FlashDust. Build legacies, chase rings, and dominate eras.",
    genre: "Sports Simulation",
    status: "Coming Soon",
    plays: "Soon",
    tag: "Coming Soon",
    image: "legacy",
    url: "#",
    accent: "purple",
    playable: false,
  },
];

const categories = ["All", "Playable", "Sports Strategy", "Sports Simulation", "Coming Soon"];

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

function getStoredJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredJson(key, value) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [loginOpen, setLoginOpen] = useState(false);
  const [clickSoundOn, setClickSoundOn] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [player, setPlayer] = useState(null);
  const [ratingData, setRatingData] = useState({ total: 0, count: 0, myRating: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [scoreName, setScoreName] = useState("");
  const [scoreValue, setScoreValue] = useState("");
  const musicRef = useRef(null);
  const featured = games[0];

  useEffect(() => {
    setPlayer(getStoredJson("flasharcade-player", null));
    setRatingData(getStoredJson("flasharcade-rating-how-many-rings", { total: 0, count: 0, myRating: 0 }));
    setLeaderboard(getStoredJson("flasharcade-leaderboard-how-many-rings", []));
  }, []);

  useEffect(() => {
    const handler = () => {
      playClickSound(clickSoundOn);
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

  const averageRating = ratingData.count ? (ratingData.total / ratingData.count).toFixed(1) : "No ratings yet";

  function randomGame() {
    window.open(featured.url, "_blank", "noopener,noreferrer");
  }

  function login(provider) {
    const user = {
      name: provider === "Google" ? "Google Player" : provider === "Discord" ? "Discord Player" : provider === "GitHub" ? "GitHub Player" : "FlashArcade Player",
      provider,
    };
    setPlayer(user);
    setScoreName(user.name);
    setStoredJson("flasharcade-player", user);
    setLoginOpen(false);
  }

  function logout() {
    setPlayer(null);
    localStorage.removeItem("flasharcade-player");
  }

  function rateGame(stars) {
    const previous = ratingData.myRating || 0;
    const next = {
      myRating: stars,
      total: previous ? ratingData.total - previous + stars : ratingData.total + stars,
      count: previous ? ratingData.count : ratingData.count + 1,
    };
    setRatingData(next);
    setStoredJson("flasharcade-rating-how-many-rings", next);
  }

  function submitScore(event) {
    event.preventDefault();
    const rings = Number(scoreValue);

    if (!Number.isFinite(rings) || rings < 0) return;

    const entry = {
      id: Date.now(),
      name: (scoreName || player?.name || "Guest Player").slice(0, 24),
      game: "How Many Rings?",
      score: rings,
      detail: rings >= 10 ? "Dynasty God" : rings >= 5 ? "Respectable Run" : "Building the legacy",
    };

    const next = [...leaderboard, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setLeaderboard(next);
    setStoredJson("flasharcade-leaderboard-how-many-rings", next);
    setScoreValue("");
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
            <p>Sign in style is ready. These buttons create a local player profile for now. Real Google/Discord login can be connected later with Firebase or Supabase.</p>

            <div className="auth-grid">
              <button onClick={() => login("Google")}>Continue with Google</button>
              <button onClick={() => login("Discord")}>Continue with Discord</button>
              <button onClick={() => login("GitHub")}>Continue with GitHub</button>
              <button onClick={() => login("Guest")}>Continue as Guest</button>
            </div>
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
            {player ? (
              <button className="login-button" onClick={logout}>
                <User size={16} /> {player.name}
              </button>
            ) : (
              <button className="login-button" onClick={() => setLoginOpen(true)}>
                <LogIn size={16} /> Login
              </button>
            )}
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
              The official home for FlashDust games, browser experiments,
              stream challenges, and future releases.
            </p>

            <div className="hero-actions">
              <a className="button primary" href={featured.url} target="_blank">
                <Play size={20} /> Play How Many Rings
              </a>
              <button className="button secondary" onClick={randomGame}>
                <Dice5 size={20} /> Random Playable Game
              </button>
            </div>

            <div className="stats">
              <Stat icon={<Gamepad2 />} value="1" label="Playable Game" />
              <Stat icon={<Trophy />} value={leaderboard.length || 0} label="Scores Submitted" />
              <Stat icon={<Star />} value={averageRating} label="Player Rating" />
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
                <span>{featured.status}</span>
              </div>
            </div>
          </a>
        </section>

        <section className="toolbar" id="library">
          <div>
            <h2>Game Library</h2>
            <p>How Many Rings? is playable now. Legacy League is the next future project.</p>
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
            <GameCard game={game} key={game.id} ratingData={ratingData} rateGame={rateGame} />
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
              <h2>How Many Rings Leaderboard</h2>
              <p>Submit your rings total after playing. This works live in your browser and saves on this device.</p>
            </div>
            <Medal size={54} />
          </div>

          <form className="score-form" onSubmit={submitScore}>
            <input
              value={scoreName}
              onChange={(event) => setScoreName(event.target.value)}
              placeholder={player ? player.name : "Your name"}
              maxLength={24}
            />
            <input
              value={scoreValue}
              onChange={(event) => setScoreValue(event.target.value)}
              placeholder="Rings won"
              type="number"
              min="0"
              max="99"
            />
            <button type="submit">Submit Score</button>
          </form>

          <div className="leaderboard-list">
            {leaderboard.length === 0 ? (
              <div className="empty-board">
                <Trophy size={34} />
                <strong>No scores yet</strong>
                <span>Play How Many Rings and submit your score here.</span>
              </div>
            ) : (
              leaderboard.map((entry, index) => (
                <div className={`leader-row rank-${index + 1}`} key={entry.id}>
                  <div className="rank">
                    {index === 0 ? <Crown size={22} /> : index + 1}
                  </div>
                  <div className="player">
                    <strong>{entry.name}</strong>
                    <span>{entry.game} • {entry.detail}</span>
                  </div>
                  <div className="score">{entry.score} Rings</div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="roadmap">
          <div>
            <span className="pill">Coming Next</span>
            <h2>FlashArcade Roadmap</h2>
            <p>
              Next upgrades can include real accounts, cloud leaderboards, Google login,
              achievements, game pages, and creator-uploaded games.
            </p>
          </div>

          <div className="roadmap-list">
            <RoadmapItem icon={<Trophy />} title="Cloud Score Saving" text="Connect games to submit scores globally." />
            <RoadmapItem icon={<Star />} title="Real Ratings" text="Save ratings for everyone, not just one browser." />
            <RoadmapItem icon={<Gamepad2 />} title="Legacy League" text="Your future sports game gets its own full store page." />
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

function GameCard({ game, ratingData, rateGame }) {
  const averageRating = ratingData.count ? (ratingData.total / ratingData.count).toFixed(1) : "Unrated";

  return (
    <article className={`game-card ${game.accent}`}>
      <GameArt type={game.image} />

      <div className="game-content">
        <div className="game-top">
          <span className="pill">{game.tag}</span>
          <span className="rating muted">{game.status}</span>
        </div>

        <h3>{game.title}</h3>
        <p>{game.subtitle}</p>

        <div className="game-meta">
          <span>{game.genre}</span>
          <span>{game.plays}</span>
        </div>

        {game.playable && (
          <div className="rating-box">
            <span>Rate this game: {averageRating}</span>
            <div className="star-buttons">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={ratingData.myRating >= star ? "selected" : ""}
                  onClick={() => rateGame(star)}
                  aria-label={`Rate ${star} stars`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        )}

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
      {type === "legacy" ? <Gamepad2 size={72} /> : null}
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
