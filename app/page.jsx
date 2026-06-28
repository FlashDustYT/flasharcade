"use client";

import {
  useEffect,
  useMemo,
  useState } from "react";import {  Bell,
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
  Shield,
  Volume2,
  VolumeX,
  Megaphone,
  Music2,
  Settings,
  Heart,
  MessageSquare,
  PlusCircle,
  CreditCard,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { loadCloudSave, saveCloudSave } from "../lib/cloudSaves";

const OWNER_EMAIL = "isaac.akinola122@gmail.com";

function isOwnerUser(user) {
  return user?.email?.toLowerCase() === OWNER_EMAIL;
}

const PLATFORM_UPDATES = [
  {
    version: "V44",
    title: "Upload permissions and free-slot lock",
    date: "Current",
    changes: [
      "Fixed Supabase permissions for creator game submissions",
      "Added clearer upload error messages when backend policies are missing",
      "First free game option now locks after a creator has a pending or approved submission",
      "Payment page now explains whether your free upload slot is still available",
      "Kept V43 pricing polish, reviews, playlists, and audio settings",
    ],
  },
  {
    version: "V43",
    title: "Creator polish, reviews, and playlists",
    date: "Current",
    changes: [
      "Upgraded the payment/pricing screen with cleaner cards and expandable info",
      "Restored visible review and rating actions on game cards",
      "Added a playlist/favorites system so players can save games to their profile",
      "Added a Playlist tab for quick access to saved games",
      "Improved Settings with audio controls from V42",
      "Included Supabase upload validation notes so creator uploads are easier to test",
    ],
  },
  {
    version: "V42",
    title: "Payment, publishing, and audio controls",
    date: "Current",
    changes: [
      "Updated Guess the Celeb with the newest uploaded build",
      "Removed duplicate Guess the Celeb game cards",
      "Payment buttons now refuse placeholder text and only open real buy.stripe.com/pay.stripe.com links",
      "Publish Game keeps any title and thumbnail regardless of ZIP filename",
      "Added UI click volume and music volume controls in Settings",
      "Kept Guess the Word and previous official games",
    ],
  },
  {
    version: "V41",
    title: "New games and platform fixes",
    date: "Current",
    changes: [
      "Added Guess the Celeb with a custom FlashPortal thumbnail",
      "Added Guess the Word with a custom FlashPortal thumbnail",
      "Upload form accepts any title and thumbnail without needing to match the ZIP filename",
      "Play counts use Supabase when available plus a local fallback",
      "Payment buttons redirect directly in the same tab",
      "Added a new Supabase backend patch for missing upload columns and play counts",
    ],
  },
  {
    version: "V40",
    title: "Backend logic and ownership fix",
    date: "Current",
    changes: [
      "Owner/admin access now requires Supabase admin_roles or the owner email",
      "Added persistent play counts through Supabase RPC",
      "Added real submission queue reading for owner/admin accounts",
      "Owner can add admins by email with permission choices after running the V40 SQL",
      "Added payment diagnostics so Stripe errors are easier to understand",
      "Removed old environment-variable-only admin behavior that could give the wrong account admin access",
    ],
  },
  {
    version: "V39",
    title: "Real game files added",
    date: "Recent",
    changes: [
      "Added uploaded How Many Rings files",
      "Added uploaded Legacy League files",
      "Updated play pages to load real game index files",
    ],
  },
  {
    version: "V38",
    title: "Owner tools and platform management",
    date: "Recent",
    changes: [
      "Changed the main account label from Admin to Owner",
      "Added game management controls",
      "Added Continue Playing close button",
      "Added owner-only admin invite UI",
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
    path: "/play/how-many-rings",
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
    path: "/play/legacy-league",
  },
  {
    id: "guess-the-word",
    title: "Guess the Word!",
    subtitle: "Emoji Word Puzzle",
    description: "Use hints, emojis, and logic to guess the hidden word.",
    genre: "Word",
    status: "New Release",
    rating: 0,
    plays: 0,
    playable: true,
    official: true,
    featured: false,
    thumbnail: "/games/guess-the-word/thumbnail.svg",
    path: "/play/guess-the-word",
  },
  {
    id: "guess-the-celeb",
    title: "Guess the Celeb",
    subtitle: "Celebrity Clue Game",
    description: "Guess the celebrity by reading clues and narrowing down the answer.",
    genre: "Strategy",
    status: "New Release",
    rating: 0,
    plays: 0,
    playable: true,
    official: true,
    featured: false,
    thumbnail: "/games/guess-the-celeb/thumbnail.svg",
    path: "/play/guess-the-celeb",
  },
];

function isValidStripePaymentUrl(url) {
  return typeof url === "string" && /^https:\/\/(buy|pay)\.stripe\.com\//i.test(url.trim());
}

function openStripePayment(url, label) {
  const cleanUrl = typeof url === "string" ? url.trim() : "";
  if (!isValidStripePaymentUrl(cleanUrl)) {
    alert(`${label} is not connected yet. In Vercel, paste the real customer-facing Stripe URL that starts with https://buy.stripe.com/ into the matching NEXT_PUBLIC_STRIPE_* variable, then redeploy.`);
    return;
  }
  window.location.assign(cleanUrl);
}

function formatRating(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric.toFixed(1) : "New";
}

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
  const [uiVolume, setUiVolume] = useState(0.45);
  const [musicVolume, setMusicVolume] = useState(0.25);
  const [playlistIds, setPlaylistIds] = useState([]);
  const [ratingDrafts, setRatingDrafts] = useState({});
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [reviews, setReviews] = useState({});
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [playCounts, setPlayCounts] = useState({});
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [toast, setToast] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [announcementDraft, setAnnouncementDraft] = useState("");
  const [continueDockOpen, setContinueDockOpen] = useState(true);
  const [managedGames, setManagedGames] = useState(BASE_GAMES);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adminPermissions, setAdminPermissions] = useState({
    games: true,
    submissions: false,
    announcements: false,
    payments: false,
  });
  const [adminRole, setAdminRole] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [paymentDebugOpen, setPaymentDebugOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("flashportal-theme", theme);
  }, [theme]);

  useEffect(() => {
    const handler = (event) => {
      const target = event.target;
      if (
        target?.closest?.("button") ||
        target?.closest?.("a") ||
        target?.closest?.("input") ||
        target?.closest?.("textarea") ||
        target?.closest?.("select")
      ) {
        playUISound("click");
      }
    };

    window.addEventListener("pointerdown", handler, { passive: true });
    window.__flashPortalGlobalClickSound = true;
    return () => window.removeEventListener("pointerdown", handler);
  }, [audioEnabled]);

  useEffect(() => {
    try {
      const savedUiVolume = Number(localStorage.getItem("flashportal-ui-volume"));
      const savedMusicVolume = Number(localStorage.getItem("flashportal-music-volume"));
      if (Number.isFinite(savedUiVolume)) setUiVolume(savedUiVolume);
      if (Number.isFinite(savedMusicVolume)) setMusicVolume(savedMusicVolume);
      setPlaylistIds(JSON.parse(localStorage.getItem("flashportal-playlist") || "[]"));
      setReviews(JSON.parse(localStorage.getItem("flashportal-reviews") || "{}"));
    } catch {}

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

  useEffect(() => {
    if (!user?.email) {
      setAdminRole(null);
      return;
    }

    async function loadAdminRole() {
      const { data, error } = await supabase
        .from("admin_roles")
        .select("email, role, permissions, active")
        .eq("email", user.email.toLowerCase())
        .eq("active", true)
        .maybeSingle();

      if (!error && data) setAdminRole(data);
      else setAdminRole(null);
    }

    loadAdminRole();
  }, [user?.email]);

  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("flashportal-play-counts") || "{}");
      setPlayCounts((current) => ({ ...cached, ...current }));
    } catch {}

    async function loadStats() {
      const { data, error } = await supabase
        .from("game_play_counts")
        .select("game_id, plays");

      if (!error && Array.isArray(data)) {
        const next = {};
        data.forEach((row) => {
          next[row.game_id] = Number(row.plays || 0);
        });
        setPlayCounts((current) => ({ ...next, ...current }));
      }
    }

    loadStats();
  }, []);

  const userIsOwner = isOwnerUser(user);
  const userIsAdmin = userIsOwner || Boolean(adminRole?.active);
  const adminPerms = userIsOwner
    ? { games: true, submissions: true, announcements: true, payments: true, admins: true }
    : adminRole?.permissions || {};

  useEffect(() => {
    if (!userIsAdmin || !adminPerms.submissions) {
      setSubmissions([]);
      return;
    }

    async function loadSubmissions() {
      const { data, error } = await supabase
        .from("game_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) setSubmissions(data);
    }

    loadSubmissions();
  }, [userIsAdmin, adminPerms.submissions]);

  const games = useMemo(
    () =>
      managedGames.map((game) => ({
        ...game,
        plays: playCounts[game.id] ?? game.plays,
      })),
    [managedGames, playCounts]
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

  useEffect(() => {
    localStorage.setItem("flashportal-ui-volume", String(uiVolume));
  }, [uiVolume]);

  useEffect(() => {
    localStorage.setItem("flashportal-music-volume", String(musicVolume));
  }, [musicVolume]);

  useEffect(() => {
    localStorage.setItem("flashportal-playlist", JSON.stringify(playlistIds));
  }, [playlistIds]);

  useEffect(() => {
    localStorage.setItem("flashportal-reviews", JSON.stringify(reviews));
  }, [reviews]);

  function togglePlaylist(gameId) {
    setPlaylistIds((current) =>
      current.includes(gameId)
        ? current.filter((id) => id !== gameId)
        : [...current, gameId]
    );
  }

  function submitReview(game) {
    const ratingValue = Number(ratingDrafts[game.id] || 0);
    const text = String(reviewDrafts[game.id] || "").trim();

    if (!ratingValue && !text) {
      setToast("Add a rating or review first");
      setTimeout(() => setToast(""), 2000);
      return;
    }

    setReviews((current) => ({
      ...current,
      [game.id]: [
        ...(current[game.id] || []),
        {
          rating: ratingValue || null,
          text,
          author: user?.email || "Guest",
          createdAt: new Date().toISOString(),
        },
      ],
    }));

    setRatingDrafts((current) => ({ ...current, [game.id]: "" }));
    setReviewDrafts((current) => ({ ...current, [game.id]: "" }));
    setToast("Review saved");
    setTimeout(() => setToast(""), 2000);
  }

  const playlistGames = games.filter((game) => playlistIds.includes(game.id));

  const totalPlays = games.reduce((sum, game) => sum + parsePlayCount(game.plays), 0);

  useEffect(() => {
    if (!recentlyPlayed.length) return;
    setContinueDockOpen(true);
    const continueDockTimer = setTimeout(() => setContinueDockOpen(false), 60000);
    return () => clearTimeout(continueDockTimer);
  }, [recentlyPlayed.length]);

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
    const localKey = "flashportal-play-counts";
    let currentLocal = {};
    try {
      currentLocal = JSON.parse(localStorage.getItem(localKey) || "{}");
    } catch {}

    const nextCount = Number(playCounts[game.id] ?? currentLocal[game.id] ?? game.plays ?? 0) + 1;
    const nextLocal = { ...currentLocal, [game.id]: nextCount };
    localStorage.setItem(localKey, JSON.stringify(nextLocal));

    setPlayCounts((current) => ({ ...current, [game.id]: nextCount }));

    try {
      const { data, error } = await supabase.rpc("increment_game_play", {
        target_game_id: game.id,
      });

      if (!error && typeof data === "number") {
        setPlayCounts((current) => ({ ...current, [game.id]: data }));
        localStorage.setItem(localKey, JSON.stringify({ ...nextLocal, [game.id]: data }));
      }
    } catch {}

    saveRecentlyPlayed(game);

    if (user) {
      await updateCloudLaunch(game);
      setToast("Cloud save updated");
      setTimeout(() => setToast(""), 2200);
    }
  }

  async function launchGame(game) {
    if (!game?.path) return;

    trackPlay(game);
    window.location.href = game.path;
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
  { id: "playlist", label: "Playlist", icon: Heart },
    { id: "updates", label: "Updates", icon: Newspaper },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "publish", label: "Publish", icon: Upload, highlight: true },
    { id: "settings", label: "Settings", icon: Settings },
    ...(userIsAdmin ? [{ id: "admin", label: userIsOwner ? "Owner" : "Admin", icon: Shield }] : []),
  ];

  function playUISound(type = "click") {
    if (!audioEnabled || typeof window === "undefined") return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      if (!window.__flashPortalAudioCtx) {
        window.__flashPortalAudioCtx = new AudioContext();
      }

      const ctx = window.__flashPortalAudioCtx;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const sounds = {
        click: { freq: 420, end: 700, length: 0.11, volume: 0.16 },
        hover: { freq: 330, end: 420, length: 0.08, volume: 0.08 },
        success: { freq: 520, end: 980, length: 0.18, volume: 0.18 },
        tab: { freq: 480, end: 760, length: 0.12, volume: 0.14 },
        alert: { freq: 740, end: 540, length: 0.16, volume: 0.14 },
      };

      const sound = sounds[type] || sounds.click;
      const now = ctx.currentTime;

      osc.type = "square";
      osc.frequency.setValueAtTime(sound.freq, now);
      osc.frequency.exponentialRampToValueAtTime(sound.end, now + sound.length);

      gain.gain.setValueAtTime(sound.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + sound.length);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + sound.length);
    } catch {}
  }

  function toggleBackgroundMusic() {
    if (typeof window === "undefined") return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      if (!window.__flashPortalAudioCtx) {
        window.__flashPortalAudioCtx = new AudioContext();
      }

      const ctx = window.__flashPortalAudioCtx;
      if (ctx.state === "suspended") ctx.resume();

      if (window.__flashPortalMusicStop) {
        window.__flashPortalMusicStop();
        window.__flashPortalMusicStop = null;
        setMusicEnabled(false);
        return;
      }

      const master = ctx.createGain();
      master.gain.value = 0.028;
      master.connect(ctx.destination);

      const notes = [110, 146.83, 164.81, 196, 220, 196, 164.81, 146.83];
      let step = 0;
      let stopped = false;

      function playStep() {
        if (stopped) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.value = notes[step % notes.length];

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.7, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + 0.5);

        step += 1;
        window.__flashPortalMusicTimer = setTimeout(playStep, 430);
      }

      window.__flashPortalMusicStop = () => {
        stopped = true;
        clearTimeout(window.__flashPortalMusicTimer);
        master.disconnect();
      };

      playStep();
      setMusicEnabled(true);
      playUISound("success");
    } catch {}
  }

  function handleTabChange(tabId) {
    playUISound("tab");
    setActiveTab(tabId);
  }

  function handleAccountClick() {
    playUISound("click");
    if (user) {
      setAccountMenuOpen((open) => !open);
      return;
    }
    signIn();
  }

  async function confirmSignOut() {
    playUISound("click");
    const shouldSignOut = window.confirm("Log out of your FlashPortal account?");
    if (!shouldSignOut) return;
    await signOut();
    setAccountMenuOpen(false);
  }

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
          <strong>V44 Online</strong>
          <p>Upload permission fix, clearer creator upload errors, and first free game lock.</p>
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
            <div className="notification-wrap">
              <button
                className="icon-button"
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  playUISound("alert");
                  setNotificationsOpen((open) => !open);
                }}
              >
                <Bell size={18} />
              </button>

              {notificationsOpen && (
                <div className="notification-panel">
                  <strong>Notifications</strong>
                  <p>No new alerts yet.</p>
                  <small>This will be used for platform announcements, upload review results, friend requests, creator updates, and game notifications.</small>
                </div>
              )}
            </div>
            <button
              className="icon-button audio-toggle-button"
              type="button"
              aria-label="Toggle sounds"
              onClick={() => {
                const next = !audioEnabled;
                setAudioEnabled(next);
                if (next) setTimeout(() => playUISound("success"), 0);
              }}
              title={audioEnabled ? "UI sounds on" : "UI sounds off"}
            >
              {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              className={`icon-button music-toggle-button ${musicEnabled ? "active" : ""}`}
              type="button"
              aria-label="Toggle background music"
              onClick={toggleBackgroundMusic}
              title={musicEnabled ? "Music on" : "Music off"}
            >
              <Music2 size={18} />
            </button>
            <button
              className="theme-button"
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>

            <div className="account-menu-wrap">
              <button className="account-button" type="button" onClick={handleAccountClick} disabled={!user && authLoading}>
                {user ? <User size={18} /> : <LogIn size={18} />}
                <span>{user ? (userIsOwner ? "FlashDust Owner" : userIsAdmin ? "FlashPortal Admin" : user.email?.split("@")[0]) : (authLoading ? "Checking..." : "Login")}</span>
              </button>

              {user && accountMenuOpen && (
                <div className="account-dropdown">
                  <div className="account-dropdown-header">
                    <strong>{userIsOwner ? "FlashDust Owner" : userIsAdmin ? "FlashPortal Admin" : user.email?.split("@")[0]}</strong>
                    <small>{user.email}</small>
                  </div>
                  <button type="button" onClick={() => handleTabChange("library")}>
                    <BookOpen size={16} /> My Library
                  </button>
                  <button type="button" onClick={() => handleTabChange("updates")}>
                    <Newspaper size={16} /> Updates
                  </button>
                  <button type="button" onClick={() => handleTabChange("settings")}>
                    <Settings size={16} /> Account Settings
                  </button>
                  {userIsAdmin && (
                    <button type="button" onClick={() => handleTabChange("admin")}>
                      <Shield size={16} /> Owner/Admin Tools
                    </button>
                  )}
                  <button type="button" onClick={confirmSignOut} className="danger">
                    <LogOut size={16} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <nav className="portal-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={`${activeTab === item.id ? "active" : ""} ${item.highlight ? "publish-nav" : ""}`}
                onClick={() => handleTabChange(item.id)}
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
                  <button className="primary-button" type="button" onClick={() => { playUISound("success"); launchGame(featuredGame); }}>
                    <Play size={18} /> Play {featuredGame.title}
                  </button>
                  <button className="secondary-button" type="button" onClick={() => { playUISound("click"); launchRandomGame(); }}>
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
              text="Submit browser games, manage your creator presence, and request promotion when you're ready."
            />

            <div className="creator-studio-grid">
              <article className="creator-studio-hero">
                <span className="eyebrow"><Upload size={16} /> Creator Uploads</span>
                <h3>Your first game submission is free.</h3>
                <p>
                  Upload a ZIP, add a thumbnail, write a short description, and send it into review.
                  Paid options are for extra submissions and featured placement only.
                </p>
                <div className="creator-studio-actions">
                  <a className="primary-link-button" href="/creator/upload">Upload Game</a>
                  <a className="secondary-link-button" href="/creator-checkout">View Paid Options</a>
                </div>
              </article>

              <article className="creator-plan-card free">
                <strong>$0</strong>
                <h3>First Game Free</h3>
                <p>Submit your first FlashPortal browser game without checkout.</p>
                <span>Best for new creators</span>
              </article>

              <article className="creator-plan-card">
                <strong>$1.99</strong>
                <h3>Extra Upload</h3>
                <p>Submit another browser game for review after your first free upload.</p>
                <span>For active creators</span>
              </article>

              <article className="creator-plan-card">
                <strong>$4.99</strong>
                <h3>Featured 7 Days</h3>
                <p>Request homepage placement for one approved game for 7 days.</p>
                <span>For promotion</span>
              </article>

              <article className="creator-plan-card">
                <strong>$9.99</strong>
                <h3>Featured 30 Days</h3>
                <p>Request longer featured placement for one approved game.</p>
                <span>Most visibility</span>
              </article>
            </div>
          </section>
        )}



        
        {activeTab === "playlist" && (
          <section className="tab-section playlist-section">
            <div className="section-heading">
              <div>
                <span>Saved Games</span>
                <h2>Your Playlist</h2>
                <p>Games you save appear here so your profile has a quick personal library.</p>
              </div>
            </div>

            {playlistGames.length ? (
              <div className="game-grid">
                {playlistGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <article className="playlist-empty-card">
                <Heart size={32} />
                <h3>No games saved yet</h3>
                <p>Click “Add to Playlist” on any game card and it will show up here.</p>
              </article>
            )}
          </section>
        )}

{activeTab === "settings" && (
          <section className="portal-view">
            <SectionHeader
              label="Settings"
              title="Customize FlashPortal"
              text="Control theme, sounds, music, account info, and platform preferences."
            />

            <div className="settings-grid">
              <article className="settings-card">
                <Sun size={28} />
                <h3>Appearance</h3>
                <p>Switch between the classic light look and the black/orange dark look.</p>
                <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  Current: {theme === "dark" ? "Dark Mode" : "Light Mode"}
                </button>
              </article>

              <article className="settings-card">
                <Volume2 size={28} />
                <h3>UI Sounds</h3>
                <p>Play a small sound when clicking buttons, links, tabs, and forms.</p>
                <button type="button" onClick={() => setAudioEnabled((enabled) => !enabled)}>
                  Sounds: {audioEnabled ? "On" : "Off"}
                </button>
              </article>

              <article className="settings-card">
                <Music2 size={28} />
                <h3>Background Music</h3>
                <p>Optional low-volume portal ambience. Browsers require you to click first.</p>
                <button type="button" onClick={toggleBackgroundMusic}>
                  Music: {musicEnabled ? "On" : "Off"}
                </button>
              </article>

              <article className="settings-card">
                <User size={28} />
                <h3>Account</h3>
                <p>{user ? `Signed in as ${user.email}` : "Sign in to use cloud saves and creator tools."}</p>
                {user ? (
                  <button type="button" onClick={confirmSignOut}>Log Out</button>
                ) : (
                  <button type="button" onClick={signIn}>Login with Google</button>
                )}
              </article>
            </div>
          
            <article className="settings-card">
              <h3>Audio Controls</h3>
              <p>Adjust click effects and background music volume.</p>
              <label className="volume-control">
                <span>UI Click Volume: {Math.round(uiVolume * 100)}%</span>
                <input type="range" min="0" max="1" step="0.05" value={uiVolume} onChange={(event) => setUiVolume(Number(event.target.value))} />
              </label>
              <label className="volume-control">
                <span>Music Volume: {Math.round(musicVolume * 100)}%</span>
                <input type="range" min="0" max="1" step="0.05" value={musicVolume} onChange={(event) => setMusicVolume(Number(event.target.value))} />
              </label>
            </article>
          </section>
        )}

        {activeTab === "admin" && userIsAdmin && (
          <section className="portal-view">
            <SectionHeader
              label={userIsOwner ? "Owner Control" : "Admin Control"}
              title={userIsOwner ? "FlashPortal owner dashboard" : "FlashPortal admin dashboard"}
              text="Manage games, review future submissions, edit announcements, and control who can help moderate the platform."
            />

            <div className="owner-grid">
              <article className="admin-card wide">
                <Megaphone size={32} />
                <h3>Global Announcement</h3>
                <p>Create a draft announcement for Updates/Notifications. Database posting comes in the next backend pass.</p>
                <textarea value={announcementDraft} onChange={(event) => setAnnouncementDraft(event.target.value)} placeholder="Example: FlashPortal V38 is live with owner tools and game management." />
                <button type="button" onClick={() => { playUISound("success"); setToast("Announcement draft saved locally"); }}>
                  Save Draft
                </button>
              </article>

              <article className="admin-card wide">
                <Gamepad2 size={32} />
                <h3>Game Management</h3>
                <p>Edit text, hide/private games, or remove games from the live list.</p>
                <div className="admin-game-list">
                  {managedGames.map((game) => (
                    <div className="admin-game-row" key={game.id}>
                      <img src={game.thumbnail} alt="" />
                      <div>
                        <strong>{game.title}</strong>
                        <small>{game.genre} · {game.status}</small>
                      </div>
                      <button type="button" onClick={() => {
                        const nextTitle = window.prompt("Edit game title:", game.title);
                        if (!nextTitle) return;
                        setManagedGames((current) => current.map((item) => item.id === game.id ? { ...item, title: nextTitle } : item));
                      }}>
                        Edit Text
                      </button>
                      <button type="button" onClick={() => {
                        setManagedGames((current) => current.map((item) => item.id === game.id ? { ...item, playable: !item.playable, status: item.playable ? "Private" : "Playable" } : item));
                      }}>
                        {game.playable ? "Private" : "Public"}
                      </button>
                      <button className="danger" type="button" onClick={() => {
                        if (window.confirm(`Delete ${game.title} from the local game list?`)) {
                          setManagedGames((current) => current.filter((item) => item.id !== game.id));
                        }
                      }}>
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </article>

              <article className="admin-card">
                <Upload size={32} />
                <h3>Submission Queue</h3>
                <p>Future uploaded games appear here for accept/decline review.</p>
                <div className="submission-placeholder">
                  {submissions.length === 0 ? (
                    <>
                      <strong>No pending submissions</strong>
                      <small>If someone submitted a game and this is empty, run the V40 SQL so owner/admin read policies are active.</small>
                      <button type="button" onClick={() => setToast("Submission queue checked")}>Check Queue</button>
                    </>
                  ) : (
                    submissions.map((submission) => (
                      <div className="submission-row" key={submission.id}>
                        <strong>{submission.title || submission.game_title || "Untitled Game"}</strong>
                        <small>{submission.category || "Uncategorized"} · {submission.status || "pending"}</small>
                        <p>{submission.description || "No description."}</p>
                        <div className="admin-button-row">
                          <button type="button" onClick={async () => {
                            await supabase.from("game_submissions").update({ status: "approved" }).eq("id", submission.id);
                            setSubmissions((current) => current.map((item) => item.id === submission.id ? { ...item, status: "approved" } : item));
                          }}>Accept</button>
                          <button className="danger" type="button" onClick={async () => {
                            await supabase.from("game_submissions").update({ status: "declined" }).eq("id", submission.id);
                            setSubmissions((current) => current.map((item) => item.id === submission.id ? { ...item, status: "declined" } : item));
                          }}>Decline</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>

              <article className="admin-card">
                <CreditCard size={32} />
                <h3>Payments</h3>
                <p>Check paid upload/featured setup and open the Stripe checkout page.</p>
                <div className="admin-button-row">
                  <a href="/creator-checkout">Payment Page</a>
                  <a href="https://dashboard.stripe.com/payment-links" target="_blank" rel="noreferrer">Stripe Dashboard</a>
                </div>
              </article>

              {userIsOwner && (
                <article className="admin-card wide">
                  <Shield size={32} />
                  <h3>Add Admin</h3>
                  <p>Owner-only. Add a helper admin by email and choose what they should be allowed to manage.</p>
                  <input value={newAdminEmail} onChange={(event) => setNewAdminEmail(event.target.value)} placeholder="admin@example.com" />
                  <div className="permission-grid">
                    {Object.entries(adminPermissions).map(([key, value]) => (
                      <label key={key}>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => setAdminPermissions((current) => ({ ...current, [key]: !current[key] }))}
                        />
                        {key}
                      </label>
                    ))}
                  </div>
                  <button type="button" onClick={async () => {
                    if (!newAdminEmail.includes("@")) {
                      setToast("Enter a valid admin email");
                      return;
                    }
                    const email = newAdminEmail.trim().toLowerCase();
                    const { error } = await supabase.from("admin_roles").upsert({
                      email,
                      role: "admin",
                      permissions: adminPermissions,
                      active: true,
                      added_by: user.id,
                    }, { onConflict: "email" });

                    if (error) {
                      setToast(`Admin save failed: ${error.message}`);
                    } else {
                      setToast(`Admin added: ${email}`);
                      setNewAdminEmail("");
                    }
                  }}>
                    Prepare Admin Invite
                  </button>
                  <small className="admin-note">Saved admins go into Supabase admin_roles after you run the V40 SQL.</small>
                </article>
              )}
            </div>
          </section>
        )}

        {recentlyPlayed.length > 0 && continueDockOpen && (
          <aside className="recent-dock single">
            <button className="recent-close" type="button" onClick={() => setContinueDockOpen(false)} aria-label="Close continue playing">×</button>
            <h3>Continue Playing</h3>
            {recentlyPlayed.slice(0, 1).map((item) => (
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
          <span>{formatRating(game.rating)}★</span>
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
