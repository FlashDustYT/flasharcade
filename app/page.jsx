"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  Cloud,
  Compass,
  Flame,
  Gamepad2,
  Home as HomeIcon,
  LogIn,
  LogOut,
  Moon,
  Newspaper,
  Play,
  Search,
  Sparkles,
  Star,
  Sun,
  Trophy,
  Upload,
  User,
  Zap,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { loadCloudSave, saveCloudSave } from "../lib/cloudSaves";

const ADMIN_EMAIL = "isaac.akinola122@gmail.com";

const PLATFORM_UPDATES = [
  {
    version: "V33",
    title: "FlashPortal platform refresh",
    date: "Current",
    changes: [
      "Full FlashPortal rebrand cleanup",
      "New black and orange dark mode",
      "Light mode keeps the older brighter FlashPortal feel",
      "Cleaner homepage layout with easier navigation",
      "New Updates section so players can see what changed",
      "Improved official thumbnails for existing FlashDust games",
      "Cloud-save foundation remains connected",
    ],
  },
  {
    version: "V31",
    title: "Cloud saves foundation",
    date: "Recent",
    changes: [
      "Added game_saves database support",
      "Signed-in players can now have launch/save metadata stored",
      "Prepared the site for full cross-device save syncing",
    ],
  },
  {
    version: "V29",
    title: "Creator upload foundation",
    date: "Recent",
    changes: [
      "Added a functional creator upload form",
      "Uploads ZIP files to Supabase Storage",
      "Uploads thumbnails to Supabase Storage",
      "Creates pending review submissions",
    ],
  },
];

const BASE_GAMES = [
  {
    id: "how-many-rings",
    title: "How Many Rings?",
    tagline: "10-Year Title Window",
    description: "Build the perfect dynasty and see how many rings your team can win.",
    genre: "Sports Strategy",
    creator: "FlashDust",
    official: true,
    playable: true,
    featured: true,
    status: "Featured",
    rating: 4.8,
    plays: 0,
    thumbnail: "/game-thumbnails/how-many-rings.svg",
    path: "/how-many-rings",
  },
  {
    id: "legacy-league",
    title: "Legacy League",
    tagline: "Career Sports Life Sim",
    description: "Build your squad, chase championships, and create a football legacy.",
    genre: "Sports Simulation",
    creator: "FlashDust",
    official: true,
    playable: true,
    featured: false,
    status: "New Release",
    rating: 4.6,
    plays: 0,
    thumbnail: "/game-thumbnails/legacy-league.svg",
    path: "/legacy-league",
  },
];

function parsePlayCount(value) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = String(value).toLowerCase().replace(/,/g, "");
  const number = parseFloat(cleaned);
  if (Number.isNaN(number)) return 0;
  if (cleaned.includes("k")) return Math.round(number * 1000);
  if (cleaned.includes("m")) return Math.round(number * 1000000);
  return Math.round(number);
}

function formatNumber(value) {
  const number = Number(value || 0);
  if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
  return number.toLocaleString();
}

function sortTrending(games) {
  return [...games].sort((a, b) => {
    const score = (game) =>
      parsePlayCount(game.plays) * 0.3 +
      Number(game.rating || 0) * 50 +
      (game.featured ? 100 : 0) +
      (game.status === "New Release" ? 40 : 0);
    return score(b) - score(a);
  });
}

export default function Home() {
  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("discover");
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [playCounts, setPlayCounts] = useState({});
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("flashportal-theme", theme);
  }, [theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("flashportal-theme");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);

    const savedRecent = localStorage.getItem("flashportal-recently-played");
    if (savedRecent) {
      try {
        setRecentlyPlayed(JSON.parse(savedRecent));
      } catch {}
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setUser(data?.session?.user || null);
        setAuthLoading(false);
      }
    }

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const games = useMemo(
    () =>
      BASE_GAMES.map((game) => ({
        ...game,
        plays: playCounts[game.id] ?? game.plays,
      })),
    [playCounts]
  );

  const filteredGames = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return games;

    return games.filter((game) =>
      [game.title, game.description, game.genre, game.creator, game.status]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [games, query]);

  const trendingGames = useMemo(() => sortTrending(filteredGames), [filteredGames]);
  const featuredGame = trendingGames[0] || games[0];
  const averageRating =
    games.length > 0
      ? (games.reduce((sum, game) => sum + Number(game.rating || 0), 0) / games.length).toFixed(1)
      : "0.0";

  const totalPlays = games.reduce((sum, game) => sum + parsePlayCount(game.plays), 0);

  function saveRecentlyPlayed(game) {
    const next = [
      {
        id: game.id,
        title: game.title,
        thumbnail: game.thumbnail,
        playedAt: new Date().toISOString(),
      },
      ...recentlyPlayed.filter((item) => item.id !== game.id),
    ].slice(0, 6);

    setRecentlyPlayed(next);
    localStorage.setItem("flashportal-recently-played", JSON.stringify(next));
  }

  async function updateCloudLaunch(game) {
    try {
      const existing = await loadCloudSave(game.id);
      const launches = Number(existing?.save_data?.launches || 0) + 1;

      await saveCloudSave(game.id, {
        gameId: game.id,
        title: game.title,
        launches,
        lastPlayedAt: new Date().toISOString(),
        note: "FlashPortal launch save. Full in-game API comes next.",
      });
    } catch (error) {
      console.warn("Cloud save update skipped:", error?.message || error);
    }
  }

  async function trackPlay(game) {
    setPlayCounts((current) => ({
      ...current,
      [game.id]: Number(current[game.id] ?? game.plays ?? 0) + 1,
    }));

    saveRecentlyPlayed(game);

    if (user) {
      await updateCloudLaunch(game);
      setToast("Cloud save updated");
      setTimeout(() => setToast(""), 2200);
    }
  }

  async function launchGame(game) {
    await trackPlay(game);

    if (game.path) {
      window.location.href = game.path;
    }
  }

  function launchRandomGame() {
    const playable = games.filter((game) => game.playable);
    const pick = playable[Math.floor(Math.random() * playable.length)];
    if (pick) launchGame(pick);
  }

  async function signIn() {
    setAuthLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  const navItems = [
    { id: "discover", label: "Discover", icon: Compass },
    { id: "library", label: "Library", icon: BookOpen },
    { id: "updates", label: "Updates", icon: Newspaper },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "publish", label: "Publish", icon: Upload },
  ];

  return (
    <main className="portal-shell">
      <aside className="portal-left">
        <div className="portal-brand-block">
          <div className="portal-logo">FP</div>
          <div>
            <strong>Flash<span>Portal</span></strong>
            <small>Browser games. Saved.</small>
          </div>
        </div>

        <div className="portal-feature-list">
          <Feature icon={Cloud} title="Cloud Saves" text="Your progress can sync to your account." />
          <Feature icon={Gamepad2} title="Play Anywhere" text="Browser games built for quick access." />
          <Feature icon={Trophy} title="Achievements" text="Progress tracking foundation is ready." />
          <Feature icon={Upload} title="Creator Tools" text="Publish, grow, and share your games." />
        </div>

        <div className="portal-mini-panel">
          <span className="status-dot" />
          <strong>V33 Online</strong>
          <p>New UI, cleaner navigation, FlashPortal branding, and an Updates tab.</p>
        </div>
      </aside>

      <section className="portal-main">
        <header className="portal-topbar">
          <div className="mobile-brand">
            <div className="portal-logo small">FP</div>
            <strong>Flash<span>Portal</span></strong>
          </div>

          <label className="portal-search">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search games, creators, or tags..."
            />
          </label>

          <div className="portal-actions">
            <button className="icon-button" type="button" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <button
              className="theme-button"
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>

            {user ? (
              <button className="account-button" type="button" onClick={signOut}>
                <User size={18} />
                <span>{user.email === ADMIN_EMAIL ? "FlashDust" : user.email?.split("@")[0]}</span>
                <LogOut size={16} />
              </button>
            ) : (
              <button className="account-button" type="button" onClick={signIn} disabled={authLoading}>
                <LogIn size={18} />
                {authLoading ? "Checking..." : "Login"}
              </button>
            )}
          </div>
        </header>

        <nav className="portal-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={activeTab === item.id ? "active" : ""}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {activeTab === "discover" && (
          <section className="portal-view">
            <div className="portal-hero">
              <div className="hero-copy">
                <span className="eyebrow"><Sparkles size={16} /> FlashDust Game Portal</span>
                <h1>
                  Play. Save. <span>Compete.</span>
                </h1>
                <p>
                  Discover browser games, keep your progress synced, rate what you play, and follow
                  the next generation of creator-made games.
                </p>
                <div className="hero-buttons">
                  <button className="primary-button" type="button" onClick={() => launchGame(featuredGame)}>
                    <Play size={18} /> Play {featuredGame.title}
                  </button>
                  <button className="secondary-button" type="button" onClick={launchRandomGame}>
                    <Gamepad2 size={18} /> Random Game
                  </button>
                </div>
              </div>

              <FeaturedCard game={featuredGame} onPlay={() => launchGame(featuredGame)} />
            </div>

            <div className="stats-grid">
              <Stat icon={Gamepad2} value={games.length} label="Playable Games" />
              <Stat icon={Cloud} value={recentlyPlayed.length} label="Cloud Saves" />
              <Stat icon={Trophy} value="0" label="Achievements" />
              <Stat icon={Star} value={averageRating} label="Avg Rating" />
              <Stat icon={Flame} value={formatNumber(totalPlays)} label="Plays" />
            </div>

            <GameRow title="Trending Now" icon={Flame} games={trendingGames} onPlay={launchGame} />
            <GameRow title="New Releases" icon={Zap} games={filteredGames.filter((game) => game.status === "New Release")} onPlay={launchGame} />
            <GameRow title="FlashPortal Originals" icon={Sparkles} games={filteredGames.filter((game) => game.official)} onPlay={launchGame} />
          </section>
        )}

        {activeTab === "library" && (
          <section className="portal-view">
            <SectionHeader
              label="Library"
              title="All playable games"
              text="Browse every currently published game on FlashPortal."
            />
            <div className="game-grid">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} onPlay={() => launchGame(game)} />
              ))}
            </div>
          </section>
        )}

        {activeTab === "updates" && (
          <section className="portal-view">
            <SectionHeader
              label="Updates"
              title="What's new on FlashPortal"
              text="A simple changelog so players and creators can see what has changed."
            />
            <div className="updates-list">
              {PLATFORM_UPDATES.map((update) => (
                <article className="update-card" key={update.version}>
                  <div className="update-version">{update.version}</div>
                  <div>
                    <small>{update.date}</small>
                    <h3>{update.title}</h3>
                    <ul>
                      {update.changes.map((change) => (
                        <li key={change}>{change}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "achievements" && (
          <section className="portal-view">
            <SectionHeader
              label="Achievements"
              title="Progress tracking is coming"
              text="Cloud saves are the foundation. Achievements, play history, and profile stats come next."
            />
            <div className="empty-panel">
              <Trophy size={42} />
              <h3>No achievements unlocked yet</h3>
              <p>V34 can add real unlockable achievements per game.</p>
            </div>
          </section>
        )}

        {activeTab === "publish" && (
          <section className="portal-view">
            <SectionHeader
              label="Creator Studio"
              title="Publish on FlashPortal"
              text="Upload browser games, submit them for review, and build your creator profile."
            />
            <div className="publish-panel">
              <Upload size={42} />
              <h3>Ready to publish?</h3>
              <p>Your first submission is free. ZIP uploads go into review before publishing.</p>
              <a className="primary-link-button" href="/creator-checkout">Open Creator Studio</a>
            </div>
          </section>
        )}

        {recentlyPlayed.length > 0 && (
          <aside className="recent-dock">
            <h3>Continue Playing</h3>
            {recentlyPlayed.slice(0, 3).map((item) => (
              <button key={item.id} type="button" onClick={() => launchGame(games.find((game) => game.id === item.id) || item)}>
                <img src={item.thumbnail} alt="" />
                <span>{item.title}</span>
              </button>
            ))}
          </aside>
        )}

        {toast && <div className="portal-toast">{toast}</div>}
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="side-feature">
      <Icon size={22} />
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

function SectionHeader({ label, title, text }) {
  return (
    <div className="section-header">
      <span>{label}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="portal-stat">
      <Icon size={24} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function FeaturedCard({ game, onPlay }) {
  return (
    <article className="featured-card">
      <img src={game.thumbnail} alt={`${game.title} thumbnail`} />
      <div className="featured-body">
        <span>{game.status}</span>
        <h2>{game.title}</h2>
        <p>{game.description}</p>
        <div className="card-tags">
          <em>{game.genre}</em>
          {game.official && <em className="official">Presented by FlashDust</em>}
        </div>
        <button className="primary-button full" type="button" onClick={onPlay}>
          Play Now
        </button>
      </div>
    </article>
  );
}

function GameRow({ title, icon: Icon, games, onPlay }) {
  if (!games.length) return null;

  return (
    <section className="game-row">
      <div className="row-heading">
        <h2><Icon size={22} /> {title}</h2>
        <button type="button">View All</button>
      </div>
      <div className="game-scroll">
        {games.map((game) => (
          <GameCard key={`${title}-${game.id}`} game={game} onPlay={() => onPlay(game)} compact />
        ))}
      </div>
    </section>
  );
}

function GameCard({ game, onPlay, compact = false }) {
  return (
    <article className={`game-card ${compact ? "compact" : ""}`}>
      <div className="thumb-wrap">
        <img src={game.thumbnail} alt={`${game.title} thumbnail`} />
        {game.official && <span className="badge official">Official</span>}
      </div>
      <div className="game-card-body">
        <h3>{game.title}</h3>
        <p>{game.tagline}</p>
        <div className="game-meta">
          <span>{game.rating.toFixed(1)}★</span>
          <span>{formatNumber(game.plays)} plays</span>
        </div>
        <div className="card-tags">
          <em>{game.genre}</em>
          <em>{game.status}</em>
        </div>
        <button type="button" onClick={onPlay}>
          <Play size={15} /> Play
        </button>
      </div>
    </article>
  );
}
