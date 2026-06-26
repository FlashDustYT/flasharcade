"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

import {
  Search,
  Play,
  Trophy,
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
  Volume2,
  VolumeX,
  Music,
  Music2,
  Star,
  ShieldCheck,
  Upload,
  X,
  Cloud,
  Settings,
  Save,
  Edit3,
  CreditCard,
} from "lucide-react";

const MAIN_SITE = "https://flashdust.dev";

const baseGames = [
  {
    id: "how-many-rings",
    title: "How Many Rings?",
    subtitle: "Build the perfect dynasty and see how many rings your team can win.",
    genre: "Sports Strategy",
    status: "Playable",
    plays: "Playable",
    tag: "Featured",
    image: "rings",
    url: "/how-many-rings",
    accent: "cyan",
    playable: true,
    official: true,
  },
  {
    id: "legacy-league",
    title: "Legacy League",
    subtitle: "Build your squad, chase championships, and create a football legacy.",
    genre: "Sports Simulation",
    status: "Playable",
    plays: "Playable",
    tag: "New Release",
    image: "legacy",
    url: "/legacy-league",
    accent: "violet",
    playable: true,
    official: true,
  },
];

const categories = ["All", "Playable", "Sports Strategy", "Sports Simulation", "Community", "Coming Soon"];

const defaultAchievements = [
  {
    id: "first-profile",
    title: "Arcade Identity",
    text: "Create a FlashArcade local profile.",
    unlocked: false,
  },
  {
    id: "first-play",
    title: "First Play",
    text: "Launch How Many Rings from FlashArcade.",
    unlocked: false,
  },
  {
    id: "first-rating",
    title: "Critic Mode",
    text: "Rate How Many Rings.",
    unlocked: false,
  },
  {
    id: "first-upload",
    title: "Game Curator",
    text: "Add a community game to your arcade library.",
    unlocked: false,
  },
];

const ADMIN_EMAIL = "isaac.akinola122@gmail.com";

const defaultPlatformCopy = {
  label: "Platform Status",
  title: "FlashArcade is online",
  description:
    "Google login is connected. Next up: cloud profiles, synced achievements, game saves, and public uploads powered by Supabase.",
  cards: [
    {
      title: "Supabase Auth",
      text: "Google login is live. GitHub and Discord can be added next.",
    },
    {
      title: "Cloud Profiles",
      text: "Player profiles, ratings, saves, and achievements are ready to move into the database.",
    },
    {
      title: "Admin Control",
      text: "Owner-only tools can manage games, copy, featured content, and platform updates.",
    },
  ],
};

function playClickSound(enabled) {
  if (!enabled || typeof window === "undefined") return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(920, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(340, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.045, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.085);
  } catch {}
}

function createArcadeAmbience() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContext();

  const master = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  master.gain.value = 0.04;
  filter.type = "lowpass";
  filter.frequency.value = 1450;

  filter.connect(master);
  master.connect(ctx.destination);

  const bass = ctx.createOscillator();
  const bassGain = ctx.createGain();
  bass.type = "triangle";
  bass.frequency.value = 49;
  bassGain.gain.value = 0.045;
  bass.connect(bassGain);
  bassGain.connect(filter);

  const pad = ctx.createOscillator();
  const padGain = ctx.createGain();
  pad.type = "sine";
  pad.frequency.value = 196;
  padGain.gain.value = 0.024;
  pad.connect(padGain);
  padGain.connect(filter);

  const pulse = ctx.createOscillator();
  const pulseGain = ctx.createGain();
  pulse.type = "square";
  pulse.frequency.value = 98;
  pulseGain.gain.value = 0.01;
  pulse.connect(pulseGain);
  pulseGain.connect(filter);

  bass.start();
  pad.start();
  pulse.start();

  const notes = [49, 58.27, 65.41, 73.42, 87.31, 98];
  let step = 0;

  const interval = setInterval(() => {
    const now = ctx.currentTime;
    const note = notes[step % notes.length];

    bass.frequency.exponentialRampToValueAtTime(note, now + 0.25);
    pad.frequency.exponentialRampToValueAtTime(note * 4, now + 0.35);
    pulseGain.gain.setValueAtTime(0.018, now);
    pulseGain.gain.exponentialRampToValueAtTime(0.003, now + 0.16);

    step += 1;
  }, 640);

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

function normalizeUrl(url) {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [profileOpen, setProfileOpen] = useState(false);
  const [addGameOpen, setAddGameOpen] = useState(false);
  const [clickSoundOn, setClickSoundOn] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [player, setPlayer] = useState(null);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [communityGames, setCommunityGames] = useState([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [platformCopy, setPlatformCopy] = useState(defaultPlatformCopy);
  const [adminDraft, setAdminDraft] = useState(defaultPlatformCopy);
  const [ratingData, setRatingData] = useState({});
  const [achievements, setAchievements] = useState(defaultAchievements);
  const [newGame, setNewGame] = useState({
    title: "",
    subtitle: "",
    genre: "Community",
    url: "",
  });
  const musicRef = useRef(null);
  const featured = baseGames[0];

  useEffect(() => {
    setPlayer(getStoredJson("flasharcade-player", null));
    const savedRatings = getStoredJson("flasharcade-ratings", {});
    setRatingData(savedRatings);
    setAchievements(getStoredJson("flasharcade-achievements", defaultAchievements));
    setCommunityGames(getStoredJson("flasharcade-community-games", []));
    const savedCopy = getStoredJson("flasharcade-platform-copy", defaultPlatformCopy);
    setPlatformCopy(savedCopy);
    setAdminDraft(savedCopy);

    function unlockLocalAchievement(id) {
      const stored = getStoredJson("flasharcade-achievements", defaultAchievements);
      const next = stored.map((achievement) =>
        achievement.id === id ? { ...achievement, unlocked: true } : achievement
      );

      setAchievements(next);
      setStoredJson("flasharcade-achievements", next);
    }

    function userToProfile(user) {
      return {
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "FlashArcade Player",
        email: user.email || "",
        avatar: user.user_metadata?.avatar_url || "",
        provider: "Google",
        id: user.id,
      };
    }

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session || null);

      if (data.session?.user) {
        const profile = userToProfile(data.session.user);
        setPlayer(profile);
        setStoredJson("flasharcade-player", profile);
        unlockLocalAchievement("first-profile");
      }

      setAuthLoading(false);
    }

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);

      if (nextSession?.user) {
        const profile = userToProfile(nextSession.user);
        setPlayer(profile);
        setStoredJson("flasharcade-player", profile);
        unlockLocalAchievement("first-profile");
      } else {
        setPlayer(null);
        localStorage.removeItem("flasharcade-player");
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
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

  const allGames = useMemo(() => {
    return [
      ...baseGames,
      ...communityGames.map((game) => ({
        ...game,
        playable: true,
        status: "Community",
        plays: "Added",
        tag: "Community",
        image: "community",
        accent: "pink",
        official: false,
      })),
    ];
  }, [communityGames]);

  useEffect(() => {
    async function loadCloudRatings() {
      const gameIds = allGames.map((game) => game.id);
      if (!gameIds.length) return;

      const localRatings = getStoredJson("flasharcade-ratings", {});

      const { data, error } = await supabase
        .from("game_ratings")
        .select("game_id,rating,user_id")
        .in("game_id", gameIds);

      if (error || !data) {
        setRatingData(localRatings);
        return;
      }

      const next = { ...localRatings };

      for (const gameId of gameIds) {
        const rows = data.filter((row) => row.game_id === gameId);
        const mine = session?.user?.id
          ? rows.find((row) => row.user_id === session.user.id)?.rating || localRatings[gameId]?.myRating || 0
          : localRatings[gameId]?.myRating || 0;

        next[gameId] = {
          total: rows.reduce((sum, row) => sum + Number(row.rating || 0), 0),
          count: rows.length,
          myRating: mine,
        };
      }

      setRatingData(next);
      setStoredJson("flasharcade-ratings", next);
    }

    loadCloudRatings();
  }, [allGames, session?.user?.id]);


  const filteredGames = useMemo(() => {
    return allGames.filter((game) => {
      const q = query.toLowerCase();
      const matchesQuery =
        game.title.toLowerCase().includes(q) ||
        game.subtitle.toLowerCase().includes(q) ||
        game.genre.toLowerCase().includes(q);

      const matchesCategory =
        category === "All" ||
        game.genre === category ||
        game.status === category ||
        game.tag === category ||
        (category === "Playable" && game.playable);

      return matchesQuery && matchesCategory;
    });
  }, [query, category, allGames]);

  const howManyRingsRating = ratingData["how-many-rings"];
  const averageRating = howManyRingsRating?.count
    ? (howManyRingsRating.total / howManyRingsRating.count).toFixed(1)
    : "Unrated";
  const unlockedCount = achievements.filter((item) => item.unlocked).length;
  const isAdmin = player?.email?.toLowerCase() === ADMIN_EMAIL;

  function profileFromUser(user) {
    return {
      name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "FlashArcade Player",
      email: user.email || "",
      avatar: user.user_metadata?.avatar_url || "",
      provider: "Google",
      id: user.id,
    };
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setPlayer(null);
    setSession(null);
    localStorage.removeItem("flasharcade-player");
  }

  function saveAdminChanges(event) {
    event.preventDefault();

    const cleaned = {
      ...adminDraft,
      label: adminDraft.label.trim() || defaultPlatformCopy.label,
      title: adminDraft.title.trim() || defaultPlatformCopy.title,
      description: adminDraft.description.trim() || defaultPlatformCopy.description,
      cards: adminDraft.cards.map((card, index) => ({
        title: card.title.trim() || defaultPlatformCopy.cards[index]?.title || "FlashArcade Update",
        text: card.text.trim() || defaultPlatformCopy.cards[index]?.text || "Update details coming soon.",
      })),
    };

    setPlatformCopy(cleaned);
    setStoredJson("flasharcade-platform-copy", cleaned);
    setAdminOpen(false);
  }

  function updateAdminCard(index, key, value) {
    const nextCards = adminDraft.cards.map((card, cardIndex) =>
      cardIndex === index ? { ...card, [key]: value } : card
    );

    setAdminDraft({ ...adminDraft, cards: nextCards });
  }

  function unlockAchievement(id) {
    const next = achievements.map((achievement) =>
      achievement.id === id ? { ...achievement, unlocked: true } : achievement
    );

    setAchievements(next);
    setStoredJson("flasharcade-achievements", next);
  }

  function launchGame(game = featured) {
    if (game.id === "how-many-rings") unlockAchievement("first-play");

    if (game.url.startsWith("/")) {
      window.location.href = game.url;
      return;
    }

    window.open(game.url, "_blank", "noopener,noreferrer");
  }

  function createLocalProfile(event) {
    event.preventDefault();

    const name = (username || "FlashArcade Player").trim().slice(0, 24);
    const localPlayer = {
      name,
      provider: "Local Profile",
    };

    setPlayer(localPlayer);
    setStoredJson("flasharcade-player", localPlayer);
    setProfileOpen(false);
    unlockAchievement("first-profile");
  }

  function logout() {
    setAccountMenuOpen(false);

    if (session) {
      signOut();
      return;
    }

    setPlayer(null);
    localStorage.removeItem("flasharcade-player");
  }

  async function rateGame(gameId, stars) {
    const current = ratingData[gameId] || { total: 0, count: 0, myRating: 0 };
    const previous = current.myRating || 0;
    const nextGameRating = {
      myRating: stars,
      total: previous ? current.total - previous + stars : current.total + stars,
      count: previous ? current.count : current.count + 1,
    };

    const nextRatings = {
      ...ratingData,
      [gameId]: nextGameRating,
    };

    setRatingData(nextRatings);
    setStoredJson("flasharcade-ratings", nextRatings);
    unlockAchievement("first-rating");

    if (session?.user?.id) {
      await supabase.from("game_ratings").upsert(
        {
          game_id: gameId,
          user_id: session.user.id,
          rating: stars,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "game_id,user_id" }
      );
    }
  }

  function addCommunityGame(event) {
    event.preventDefault();

    const title = newGame.title.trim().slice(0, 46);
    const subtitle = newGame.subtitle.trim().slice(0, 120);
    const url = normalizeUrl(newGame.url.trim());

    if (!title || !url || url === "#") return;

    const game = {
      id: `community-${Date.now()}`,
      title,
      subtitle: subtitle || "A community-added browser game.",
      genre: newGame.genre.trim().slice(0, 32) || "Community",
      url,
    };

    const next = [game, ...communityGames].slice(0, 24);
    setCommunityGames(next);
    setStoredJson("flasharcade-community-games", next);
    setNewGame({ title: "", subtitle: "", genre: "Community", url: "" });
    setAddGameOpen(false);
    unlockAchievement("first-upload");
  }

  function removeCommunityGame(id) {
    const next = communityGames.filter((game) => game.id !== id);
    setCommunityGames(next);
    setStoredJson("flasharcade-community-games", next);
  }

  return (
    <main>
      <div className="bg-grid" />
      <div className="bg-orbit one" />
      <div className="bg-orbit two" />
      <div className="scanlines" />

      {profileOpen && (
        <section className="modal-backdrop" onClick={() => setProfileOpen(false)}>
          <div className="login-modal" onClick={(event) => event.stopPropagation()}>
            <button className="close" onClick={() => setProfileOpen(false)}>×</button>
            <div className="modal-icon"><User size={30} /></div>
            <h2>FlashArcade Profile</h2>
            <p>Sign in with Google to keep your FlashArcade account across visits. Local profile is still here as a backup.</p>

            <div className="profile-form">
              <button type="button" onClick={signInWithGoogle}>
                Continue with Google
              </button>
            </div>

            <div className="divider-text">or use this device only</div>

            <form className="profile-form" onSubmit={createLocalProfile}>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Choose a display name"
                maxLength={24}
              />
              <button type="submit" className="secondary-profile-button">Create Local Profile</button>
            </form>

            <div className="auth-disabled">
              <button disabled><Cloud size={16} /> GitHub Login Coming Next</button>
            </div>
          </div>
        </section>
      )}

      {adminOpen && isAdmin && (
        <section className="modal-backdrop" onClick={() => setAdminOpen(false)}>
          <div className="login-modal admin-modal" onClick={(event) => event.stopPropagation()}>
            <button className="close" onClick={() => setAdminOpen(false)}>×</button>
            <div className="modal-icon"><Settings size={30} /></div>
            <h2>FlashArcade Admin</h2>
            <p>Owner mode is active for {ADMIN_EMAIL}. Edit the platform status section below.</p>

            <form className="profile-form admin-form" onSubmit={saveAdminChanges}>
              <input
                value={adminDraft.label}
                onChange={(event) => setAdminDraft({ ...adminDraft, label: event.target.value })}
                placeholder="Small label"
              />
              <input
                value={adminDraft.title}
                onChange={(event) => setAdminDraft({ ...adminDraft, title: event.target.value })}
                placeholder="Section title"
              />
              <textarea
                value={adminDraft.description}
                onChange={(event) => setAdminDraft({ ...adminDraft, description: event.target.value })}
                placeholder="Section description"
              />

              <div className="admin-card-editor">
                {adminDraft.cards.map((card, index) => (
                  <div className="admin-card-fields" key={index}>
                    <span>Card {index + 1}</span>
                    <input
                      value={card.title}
                      onChange={(event) => updateAdminCard(index, "title", event.target.value)}
                      placeholder="Card title"
                    />
                    <textarea
                      value={card.text}
                      onChange={(event) => updateAdminCard(index, "text", event.target.value)}
                      placeholder="Card text"
                    />
                  </div>
                ))}
              </div>

              <button type="submit">
                <Save size={17} /> Save Admin Changes
              </button>
            </form>
          </div>
        </section>
      )}

      {addGameOpen && (
        <section className="modal-backdrop" onClick={() => setAddGameOpen(false)}>
          <div className="login-modal add-modal" onClick={(event) => event.stopPropagation()}>
            <button className="close" onClick={() => setAddGameOpen(false)}>×</button>
            <div className="modal-icon"><Upload size={30} /></div>
            <h2>Add Game</h2>
            <p>Add a browser game link to your local FlashArcade library. It will stay saved on this device.</p>

            <form className="profile-form" onSubmit={addCommunityGame}>
              <input
                value={newGame.title}
                onChange={(event) => setNewGame({ ...newGame, title: event.target.value })}
                placeholder="Game title"
                maxLength={46}
              />
              <input
                value={newGame.url}
                onChange={(event) => setNewGame({ ...newGame, url: event.target.value })}
                placeholder="Game URL"
              />
              <input
                value={newGame.genre}
                onChange={(event) => setNewGame({ ...newGame, genre: event.target.value })}
                placeholder="Genre"
                maxLength={32}
              />
              <textarea
                value={newGame.subtitle}
                onChange={(event) => setNewGame({ ...newGame, subtitle: event.target.value })}
                placeholder="Short description"
                maxLength={120}
              />
              <button type="submit">Add Game to Arcade</button>
            </form>
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
            <a href="#achievements">Achievements</a>
            <a href="/creator-checkout"><CreditCard size={16} /> Publish</a>
            <a href={MAIN_SITE}><Home size={16} /> FlashDust</a>
            <button className="login-button audio-button" onClick={() => setClickSoundOn((value) => !value)} title="Toggle click sound">
              {clickSoundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button className="login-button audio-button" onClick={() => setMusicOn((value) => !value)} title="Toggle arcade background music">
              {musicOn ? <Music2 size={16} /> : <Music size={16} />}
            </button>
            {player ? (
              <div className="account-menu-wrap">
                <button
                  className="login-button"
                  onClick={() => setAccountMenuOpen((value) => !value)}
                  title="Open account menu"
                >
                  {player.avatar ? <img className="nav-avatar" src={player.avatar} alt="" /> : <User size={16} />}
                  {player.name}
                </button>

                {accountMenuOpen && (
                  <div className="account-menu">
                    <div className="account-menu-head">
                      {player.avatar ? <img className="account-avatar" src={player.avatar} alt="" /> : <User size={22} />}
                      <div>
                        <strong>{player.name}</strong>
                        <span>{player.email || player.provider}</span>
                      </div>
                    </div>

                    {isAdmin && (
                      <button onClick={() => { setAdminOpen(true); setAccountMenuOpen(false); }}>
                        <Settings size={16} /> Admin Panel
                      </button>
                    )}

                    <button onClick={logout}>
                      <LogIn size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="login-button" onClick={() => setProfileOpen(true)}>
                <LogIn size={16} /> {authLoading ? "Checking..." : "Login"}
              </button>
            )}
            {isAdmin && (
              <button className="login-button admin-nav-button" onClick={() => setAdminOpen(true)}>
                <Settings size={16} /> Admin
              </button>
            )}
          </nav>
        </header>

        <section className="hero" id="featured">
          <div className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={16} />
              FlashDust Game Portal
            </div>

            <h1>
              Neon games.
              <span>Built to play.</span>
            </h1>

            <p>
              The official home for FlashDust games, community links,
              browser experiments, and future releases.
            </p>

            <div className="hero-actions">
              <button className="button primary" onClick={() => launchGame(featured)}>
                <Play size={20} /> Play How Many Rings
              </button>
              <button className="button secondary" onClick={() => launchGame(featured)}>
                <Dice5 size={20} /> Random Playable Game
              </button>
              <button className="button ghost" onClick={() => window.location.href = "/creator-checkout"}>
                <CreditCard size={20} /> Publish Game
              </button>
            </div>

            <div className="stats">
              <Stat icon={<Gamepad2 />} value={allGames.filter((game) => game.playable).length} label="Playable Games" />
              <Stat icon={<Trophy />} value={unlockedCount} label="Achievements" />
              <Stat icon={<Star />} value={averageRating} label="Player Rating" />
            </div>
          </div>

          <button className="featured-card" onClick={() => launchGame(featured)}>
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
          </button>
        </section>

        <section className="toolbar" id="library">
          <div>
            <h2>Game Library</h2>
            <p>How Many Rings? is playable now. Legacy League is the next future project. Added games save on this device.</p>
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
            <GameCard
              game={game}
              key={game.id}
              ratingData={ratingData}
              rateGame={rateGame}
              launchGame={launchGame}
              removeCommunityGame={removeCommunityGame}
            />
          ))}

          <article className="game-card add-game-card" onClick={() => window.location.href = "/creator-checkout"}>
            <div className="submit-lock">
              <PlusCircle size={76} />
            </div>
            <div className="game-content">
              <span className="pill">Community</span>
              <h3>Publish Your Game</h3>
              <p>Submit your browser game through FlashArcade Creator Studio.</p>
              <button className="play-link" type="button">Start Publishing</button>
            </div>
          </article>
        </section>

        <section className="achievements" id="achievements">
          <div className="leaderboard-head">
            <div>
              <span className="pill">Player Progress</span>
              <h2>Achievements</h2>
              <p>Achievements unlock from actions on FlashArcade. Cloud achievements need Supabase/Firebase later.</p>
            </div>
            <Medal size={54} />
          </div>

          <div className="achievement-grid">
            {achievements.map((achievement) => (
              <article className={`achievement-card ${achievement.unlocked ? "unlocked" : ""}`} key={achievement.id}>
                <div className="achievement-icon">
                  {achievement.unlocked ? <ShieldCheck size={30} /> : <Lock size={28} />}
                </div>
                <div>
                  <h3>{achievement.title}</h3>
                  <p>{achievement.text}</p>
                  <span>{achievement.unlocked ? "Unlocked" : "Locked"}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="roadmap steam-panel">
          <div>
            <span className="pill">{platformCopy.label}</span>
            <h2>{platformCopy.title}</h2>
            <p>{platformCopy.description}</p>

            {isAdmin && (
              <button className="button admin-edit-button" onClick={() => setAdminOpen(true)}>
                <Edit3 size={18} /> Edit This Section
              </button>
            )}
          </div>

          <div className="roadmap-list">
            <RoadmapItem icon={<Cloud />} title={platformCopy.cards[0].title} text={platformCopy.cards[0].text} />
            <RoadmapItem icon={<Upload />} title={platformCopy.cards[1].title} text={platformCopy.cards[1].text} />
            <RoadmapItem icon={<Trophy />} title={platformCopy.cards[2].title} text={platformCopy.cards[2].text} />
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

function GameCard({ game, ratingData, rateGame, launchGame, removeCommunityGame }) {
  const howManyRingsRating = ratingData["how-many-rings"];
  const averageRating = howManyRingsRating?.count
    ? (howManyRingsRating.total / howManyRingsRating.count).toFixed(1)
    : "Unrated";

  return (
    <article className={`game-card ${game.accent}`}>
      {!game.official && (
        <button className="remove-game" onClick={() => removeCommunityGame(game.id)} title="Remove game">
          <X size={16} />
        </button>
      )}

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

        <div className="rating-box">
          <span>Average rating: {averageRating}</span>
          <div className="star-buttons">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={gameRating.myRating >= star ? "selected" : ""}
                onClick={() => rateGame(game.id, star)}
                aria-label={`Rate ${game.title} ${star} stars`}
              >
                ★
              </button>
            ))}
          </div>
          <small>{gameRating.count || 0} rating{gameRating.count === 1 ? "" : "s"}</small>
        </div>

        {game.playable ? (
          <button className="play-link" onClick={() => launchGame(game)}>
            Play Now <ExternalLink size={16} />
          </button>
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
      {type === "community" ? <Sparkles size={72} /> : null}
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
