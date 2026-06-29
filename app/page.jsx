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
  Users,
  Trash2,
  Send,
  CreditCard,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { loadCloudSave, saveCloudSave } from "../lib/cloudSaves";

function goToRealRoute(path) {
  if (typeof window !== "undefined") {
    window.location.href = path;
  }
}

const OWNER_EMAIL = "isaac.akinola122@gmail.com";

function isOwnerUser(user) {
  return user?.email?.toLowerCase() === OWNER_EMAIL;
}

function getScopedKey(prefix, email) {
  const safeEmail = String(email || (typeof window !== "undefined" ? window.__flashPortalCurrentUserEmail : "guest") || "guest")
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, "_");
  return `${prefix}-${safeEmail || "guest"}`;
}

function getPlaylistKey(email) {
  return getScopedKey("flashportal-playlist", email);
}

function creatorSlug(name) {
  return String(name || "FlashPortal Creator")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "creator";
}

function getCreatorFollowKey(email) {
  return getScopedKey("flashportal-followed-creators", email);
}

function avatarInitials(name) {
  const parts = String(name || "FP").trim().split(/\s+/).filter(Boolean);
  const raw = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : String(name || "FP").slice(0, 2);
  return raw.toUpperCase();
}

const PLATFORM_UPDATES = [
  {
    version: "V69",
    title: "Message, avatar, and rating polish",
    date: "Current",
    changes: [
      "Fixed message sending policy recursion",
      "Avatar images now stay inside their frames",
      "Homepage game cards now pull live review averages",
      "Rating-only submissions update public cards after refresh",
      "Kept accurate Last Seen status"
    ],
  },
  {
    version: "V67",
    title: "Creator profile 404 fix",
    date: "Current",
    changes: [
      "Removed old creator_slug lookup that caused Supabase 404 errors",
      "Creator cards now use username/profile ID routing",
      "Kept V66 Guess The Word update",
      "No new SQL required"
    ],
  },
  {
    version: "V66",
    title: "Guess The Word update",
    date: "Current",
    changes: [
      "Replaced the live Guess The Word game files with the newest uploaded ZIP",
      "Kept V65 profile/creator fixes",
      "Added a clear messaging roadmap so the Message button is not misleading",
      "No new database changes required for the game update"
    ],
  },
  {
    version: "V65",
    title: "Creator profile hotfix",
    date: "Current",
    changes: [
      "View Profile now uses a safer profile lookup",
      "Message no longer opens a blank browser tab",
      "Creator Hub no longer errors on missing user_profiles.is_deleted",
      "Image upload button is smaller and fits the post composer better"
    ],
  },
  {
    version: "V64",
    title: "Creator social/profile release pass",
    date: "Current",
    changes: [
      "Creators now opens a creator directory, while Creator Hub stays the community feed",
      "Profile editor and posts support file image uploads instead of URL-only",
      "Users can delete or private/unprivate their own posts",
      "Public profile lookup is more forgiving for usernames and email names",
      "Online dots show recent creator activity"
    ],
  },
  {
    version: "V63",
    title: "Actual homepage wiring fix",
    date: "Current",
    changes: [
      "Settings button now opens /profile instead of the old settings tab",
      "Creator Hub and Creators buttons now open /creator-hub",
      "Old local creator follow button can no longer work while logged out",
      "Following from old creator cards now requires a real account",
      "Account Settings dropdown now reaches the real profile editor"
    ],
  },
  {
    version: "V62",
    title: "Routing wired to real profile pages",
    date: "Current",
    changes: [
      "Account Settings opens the real /profile editor",
      "Creator Hub opens the real community feed page",
      "Roadmap/About content moved to /about",
      "Old fake in-page profile flow is bypassed",
      "Follow/profile pages use the Supabase-backed routes"
    ],
  },
  {
    version: "V61",
    title: "Real profile/follow backend fix",
    date: "Current",
    changes: [
      "Profile editor is now always visible at /profile",
      "Username, avatar, banner, bio, and privacy save to Supabase",
      "Follow requires login and stores in profile_follows",
      "Follower count now reloads from the database instead of fake local state",
      "Creator Hub is now only the community feed; roadmap moved to /about",
      "Follower count opens a real followers list page"
    ],
  },
  {version:"V60",title:"Profile save, followers, and Creator Hub rework",date:"Current",changes:["Username/avatar/banner/bio/privacy save from /profile","Follow requires login and persists after refresh","Followers count opens follower list","Creator Hub is now a community feed","Roadmap moved to /about"]},
  {
    version: "V59",
    title: "Persistent follows and profile privacy",
    date: "Current",
    changes: [
      "Follow counts now save after refresh",
      "Added public/private profile toggle",
      "Added public profile pages",
      "Creator Hub shows followers, games, posts, and privacy status",
    ],
  },
  {
    version: "V58",
    title: "Social profiles and Creator Hub",
    date: "Current",
    changes: [
      "Added My Homepage profile page",
      "Users can change display name, username, bio, avatar, and banner",
      "Added creator/player feed posts with optional image URLs",
      "Added Creator Hub page for discovering creators and posts",
      "Email no longer has to be the public-facing name",
    ],
  },
  {
    version: "V57",
    title: "Creator profiles accuracy and free-upload update",
    date: "Current",
    changes: [
      "Creator profiles now use real uploaded/live games",
      "Follower counts start at 0 and grow from actual follows instead of fake sample numbers",
      "Uploaded approved games appear under their creator email/profile",
      "Free creator uploads increased from 1 game to 3 games",
      "Creator cards have clearer accurate stats for games, plays, and average rating",
    ],
  },
  {
    version: "V55",
    title: "Release UI polish",
    date: "Current",
    changes: [
      "Custom black/orange scrollbars replace the default gray browser bar",
      "Game rows now have cleaner spacing, edge fades, and smoother scrolling",
      "Save and Review buttons are smaller and better aligned",
      "Continue Playing is less intrusive and disappears faster",
      "HUD, notification badge, cards, and mobile layout received final polish",
    ],
  },
  {
    version: "V54",
    title: "Official release polish",
    date: "Current",
    changes: [
      "Fixed creator pricing so Extra Upload uses the $1.99 Stripe link",
      "Continue Playing now disappears after a few seconds",
      "Added release-roadmap cards for creator profiles, weekly trending, daily challenges, badges, wishlists, and creator follows",
      "Improved game action spacing so Save and Review feel less crowded",
      "Volume sliders are wired to live audio gain and stay at true mute when set to 0%",
    ],
  },
  {
    version: "V53",
    title: "Release polish and cleanup",
    date: "Current",
    changes: [
      "Review and Save buttons are smaller and cleaner on game cards",
      "Playlists are now stored per signed-in account",
      "Friend requests load as received or sent based on the current account",
      "Owner delete removes the game from management and the public list",
      "Notification badge appears when announcements or requests exist",
      "Volume sliders are restored and now control click and music volume",
    ],
  },
  {
    version: "V52",
    title: "Release-candidate polish",
    date: "Current",
    changes: [
      "Added heart/save buttons on every game card",
      "Playlist updates immediately when a game is saved",
      "Friends can now be removed/unfriended",
      "Owner private/delete actions persist through Supabase/local fallback",
      "Rejected submissions disappear from the queue",
      "First free upload locks after a creator has a pending or approved submission",
      "Removed the broken audio control cards from Settings",
    ],
  },
  {
    version: "V50",
    title: "Reviews and ratings fix",
    date: "Current",
    changes: [
      "Added visible Review / Rate buttons on game cards",
      "Added a real reviews page for each game",
      "Users can pick 1-5 stars and write a public review",
      "Reviews save to Supabase after SQL, with local fallback before SQL",
      "Audio sliders are hidden so they stop causing confusion",
    ],
  },
  {
    version: "V49",
    title: "SQL cleanup and audio simplification",
    date: "Current",
    changes: [
      "One SQL file is now the only backend setup step",
      "Broken audio sliders are removed from the visible UI",
      "Submission queue message now points to V51 SQL",
      "Notifications, reviews, friends, announcements, and queue all use the same backend setup",
      "New Releases should sort newest to oldest after deploy",
    ],
  },
  {
    version: "V48",
    title: "Backend cleanup pass",
    date: "Current",
    changes: [
      "Single SQL file replaces old V40/V44/V45/V46/V47 scripts",
      "Review / Rate links are forced onto every game card",
      "Announcements save to Supabase and show in notifications",
      "New Releases sort newest to oldest",
      "FlashPortal Originals only shows owner-posted games",
      "Audio sliders now truly control volume instead of just toggles",
      "Owner queue message now points to V51 SQL",
    ],
  },
  {
    version: "V47",
    title: "Reviews, ratings, audio, and upload hotfix",
    date: "Current",
    changes: [
      "Reviews are now obvious and clickable on every game card",
      "Review pages save star ratings and written reviews",
      "0% audio is true mute",
      "1%+ audio scales upward normally",
      "Upload SQL adds missing creator_email and review columns safely",
      "Duplicate SQL policy errors are avoided by dropping old policies first",
    ],
  },
  {
    version: "V46",
    title: "Real queue, announcements, reviews, and friends cleanup",
    date: "Current",
    changes: [
      "Friend requests now separate sent requests from received requests",
      "Owner submission queue now reads the real Supabase table after V51 SQL",
      "Announcements can be sent to the notification bell instead of only saved as drafts",
      "Notifications can be deleted after reading",
      "Review links are visible on game cards and open public review pages",
      "Creator pricing screen is cleaner and less scattered",
    ],
  },
  {
    version: "V45",
    title: "Audio, reviews, friends, and upload fixes",
    date: "Current",
    changes: [
      "Audio buttons now open a real control panel instead of only toggling icons",
      "Added proper game review pages with public reviews and star ratings",
      "Added Friends page foundation with add by email/username, requests, and friend list",
      "Fixed AVG rating so unrated games do not drag the average down",
      "Added stronger Supabase SQL for upload permission errors",
      "Kept payment, playlist, and creator pricing improvements",
    ],
  },
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
    const playDiff = parsePlayCount(b.plays) - parsePlayCount(a.plays);
    if (playDiff !== 0) return playDiff;

    const ratingDiff = Number(b.rating || 0) - Number(a.rating || 0);
    if (ratingDiff !== 0) return ratingDiff;

    const bt = new Date(b.created_at || b.createdAt || 0).getTime() || 0;
    const at = new Date(a.created_at || a.createdAt || 0).getTime() || 0;
    return bt - at;
  });
}


function slugFromTitle(title, fallback = "uploaded-game") {
  const slug = String(title || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function submissionToGame(submission) {
  const title = submission.title || submission.game_title || "Untitled Game";
  const id = submission.game_id || `submission-${submission.id || slugFromTitle(title)}`;
  let thumbnail = "/game-thumbnails/default.svg";

  if (submission.thumbnail_url) {
    thumbnail = submission.thumbnail_url;
  } else if (submission.thumbnail_path) {
    const { data } = supabase.storage.from("game-thumbnails").getPublicUrl(submission.thumbnail_path);
    thumbnail = data?.publicUrl || thumbnail;
  }

  return {
    id,
    title,
    tagline: submission.category || "Creator Game",
    description: submission.description || "Creator-submitted FlashPortal game.",
    genre: submission.category || "Creator",
    creator: submission.creator_email || submission.creator_name || "FlashPortal Creator",
    official: false,
    playable: true,
    featured: false,
    status: "New Release",
    rating: 0,
    plays: 0,
    thumbnail,
    path: submission.website_url || `/reviews/${id}`,
    created_at: submission.created_at || new Date().toISOString(),
    submissionId: submission.id,
  };
}

function sortNewest(games) {
  return [...games].sort((a, b) => {
    const at = new Date(a.created_at || a.createdAt || 0).getTime() || 0;
    const bt = new Date(b.created_at || b.createdAt || 0).getTime() || 0;
    return bt - at;
  });
}


function RealRouteNotice({ title, path }) {
  return (
    <section className="real-route-notice">
      <h1>{title}</h1>
      <p>This section now lives on its own real page.</p>
      <button type="button" onClick={() => goToRealRoute(path)}>Open {title}</button>
    </section>
  );
}

export default function Home() {
  const getScaledVolume = (value) => {
    const n = Number(value) || 0;
    if (n <= 0) return 0;
    return Math.max(0.01, Math.min(1, n));
  };
  const isAudioMuted = (value) => getScaledVolume(value) <= 0;

  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("discover");
  const [uiVolume, setUiVolume] = useState(1);
  const [musicVolume, setMusicVolume] = useState(1);

  function getEffectiveVolume(value) {
    const numeric = Number(value) || 0;
    return numeric <= 0 ? 0 : Math.min(1, numeric);
  }

  const [friendLookup, setFriendLookup] = useState("");
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentFriendRequests, setSentFriendRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [announcementTitle, setAnnouncementTitle] = useState("FlashPortal Announcement");
  const [submissionQueue, setSubmissionQueue] = useState([]);
  const [friends, setFriends] = useState([]);
  const [playlistIds, setPlaylistIds] = useState([]);
  const [followedCreators, setFollowedCreators] = useState([]);
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
  const [gameVisibility, setGameVisibility] = useState({});
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
  const [creatorFollowerCounts, setCreatorFollowerCounts] = useState({});
  const [reviewRatings, setReviewRatings] = useState({});

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
      setPlaylistIds(JSON.parse(localStorage.getItem(getPlaylistKey(user?.email)) || "[]"));
      setReviews(JSON.parse(localStorage.getItem("flashportal-reviews") || "{}"));
      setFriends(JSON.parse(localStorage.getItem(getScopedKey("flashportal-friends", user?.email)) || "[]"));
      setFriendRequests(JSON.parse(localStorage.getItem(getScopedKey("flashportal-friend-requests", user?.email)) || "[]"));
      setSentFriendRequests(JSON.parse(localStorage.getItem(getScopedKey("flashportal-sent-friend-requests", user?.email)) || "[]"));
      setNotifications(JSON.parse(localStorage.getItem("flashportal-notifications") || "[]"));
    } catch {}

    const savedTheme = localStorage.getItem("flashportal-theme");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);

    const savedUiVolume = localStorage.getItem("flashportal-ui-volume");
    if (savedUiVolume !== null) setUiVolume(Math.max(0, Math.min(1, Number(savedUiVolume) || 0)));

    const savedMusicVolume = localStorage.getItem("flashportal-music-volume");
    if (savedMusicVolume !== null) setMusicVolume(Math.max(0, Math.min(1, Number(savedMusicVolume) || 0)));

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
    if (typeof window !== "undefined") {
      const playlistKey = getPlaylistKey(user?.email);
      window.__flashPortalCurrentUserEmail = user?.email || "guest";
      try {
        setPlaylistIds(JSON.parse(localStorage.getItem(playlistKey) || "[]"));
      } catch {
        setPlaylistIds([]);
      }
    }
  }, [user?.email]);

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
    async function loadApprovedSubmissions() {
      const { data, error } = await supabase
        .from("game_submissions")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        const approvedGames = data.map(submissionToGame);
        setManagedGames((current) => {
          const official = current.filter((game) => game.official);
          const currentCustom = current.filter((game) => !game.official && !approvedGames.some((approved) => approved.id === game.id));
          return [...official, ...approvedGames, ...currentCustom];
        });
      }
    }

    loadApprovedSubmissions();
  }, []);

  useEffect(() => {
    async function loadGameVisibility() {
      let localVisibility = {};
      try {
        localVisibility = JSON.parse(localStorage.getItem("flashportal-game-visibility") || "{}");
      } catch {}

      const { data, error } = await supabase
        .from("game_visibility")
        .select("game_id, hidden, deleted");

      if (!error && Array.isArray(data)) {
        const remoteVisibility = {};
        data.forEach((row) => {
          remoteVisibility[row.game_id] = { hidden: Boolean(row.hidden), deleted: Boolean(row.deleted) };
        });
        setGameVisibility({ ...localVisibility, ...remoteVisibility });
      } else {
        setGameVisibility(localVisibility);
      }
    }

    loadGameVisibility();
  }, []);

  useEffect(() => {
    async function loadAnnouncements() {
      const { data, error } = await supabase
        .from("platform_announcements")
        .select("id, title, body, created_at")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && Array.isArray(data)) {
        let dismissed = [];
        try { dismissed = JSON.parse(localStorage.getItem("flashportal-dismissed-notifications") || "[]"); } catch {}
        setNotifications(data
          .map((item) => ({
            id: `announcement-${item.id}`,
            title: item.title || "FlashPortal Announcement",
            body: item.body || "",
            created_at: item.created_at,
            type: "announcement",
          }))
          .filter((item) => !dismissed.includes(item.id))
        );
      }
    }

    loadAnnouncements();
  }, []);

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


  useEffect(() => {
    async function loadReviewRatings() {
      const { data, error } = await supabase
        .from("game_reviews")
        .select("game_id, rating");

      if (!error && Array.isArray(data)) {
        const grouped = {};
        data.forEach((row) => {
          const gameId = row.game_id;
          const value = Number(row.rating);
          if (!gameId || !Number.isFinite(value) || value < 1 || value > 5) return;
          if (!grouped[gameId]) grouped[gameId] = [];
          grouped[gameId].push(value);
        });

        const next = {};
        Object.entries(grouped).forEach(([gameId, values]) => {
          next[gameId] = Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
        });

        setReviewRatings(next);
      }
    }

    loadReviewRatings();

    function refreshReviewRatings() {
      loadReviewRatings();
    }

    window.addEventListener("flashportal-reviews-changed", refreshReviewRatings);
    return () => window.removeEventListener("flashportal-reviews-changed", refreshReviewRatings);
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
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) setSubmissions(data);
    }

    loadSubmissions();
  }, [userIsAdmin, adminPerms.submissions]);

  const games = useMemo(
    () =>
      managedGames
        .filter((game) => !gameVisibility[game.id]?.deleted)
        .map((game) => ({
          ...game,
          playable: gameVisibility[game.id]?.hidden ? false : game.playable,
          status: gameVisibility[game.id]?.hidden ? "Private" : game.status,
          plays: playCounts[game.id] ?? game.plays,
          rating: reviewRatings[game.id] ?? game.rating,
        })),
    [managedGames, playCounts, gameVisibility, reviewRatings]
  );

  const publicGames = useMemo(
    () => games.filter((game) => game.playable !== false),
    [games]
  );

  const filteredGames = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return publicGames;

    return publicGames.filter((game) =>
      [game.title, game.description, game.genre, game.creator, game.status]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [publicGames, query]);

  const trendingGames = useMemo(() => sortTrending(filteredGames), [filteredGames]);
  const featuredGame = trendingGames[0] || publicGames[0] || games[0];
  const ratedGamesForAverage = publicGames.filter((game) => Number(game.rating) > 0);
  const averageRating = ratedGamesForAverage.length
    ? (ratedGamesForAverage.reduce((sum, game) => sum + Number(game.rating), 0) / ratedGamesForAverage.length).toFixed(1)
    : "New";

  useEffect(() => {
    localStorage.setItem("flashportal-ui-volume", String(uiVolume));
    if (uiVolume <= 0) setAudioEnabled(false);
    else setAudioEnabled(true);
  }, [uiVolume]);

  useEffect(() => {
    localStorage.setItem("flashportal-music-volume", String(musicVolume));
    if (typeof window !== "undefined" && window.__flashPortalMusicGain) {
      window.__flashPortalMusicGain.gain.value = musicVolume <= 0 ? 0 : 0.028 * Math.max(0, Math.min(1, musicVolume));
    }
    if (musicVolume <= 0) {
      setMusicEnabled(false);
      if (typeof window !== "undefined" && window.__flashPortalMusicStop) {
        window.__flashPortalMusicStop();
        window.__flashPortalMusicStop = null;
      }
    }
  }, [musicVolume]);

  useEffect(() => {
    localStorage.setItem(getScopedKey("flashportal-sent-friend-requests", user?.email), JSON.stringify(sentFriendRequests));
  }, [sentFriendRequests, user?.email]);

  useEffect(() => {
    localStorage.setItem("flashportal-notifications", JSON.stringify(notifications));
  }, [notifications]);

  async function sendAnnouncementNow() {
    const body = String(announcementDraft || "").trim();
    if (!body) {
      setToast("Write an announcement first");
      setTimeout(() => setToast(""), 2000);
      return;
    }

    const newAnnouncement = {
      id: Date.now(),
      title: announcementTitle || "FlashPortal Announcement",
      body,
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from("platform_announcements").insert({
        title: newAnnouncement.title,
        body: newAnnouncement.body,
        created_by: user?.id || null,
        created_by_email: user?.email || "",
        active: true,
      });
    } catch {}

    setNotifications((current) => [newAnnouncement, ...current]);
    setAnnouncementDraft("");
    setToast("Announcement sent");
    setTimeout(() => setToast(""), 2200);
  }

  function deleteNotification(id) {
    setNotifications((current) => current.filter((item) => item.id !== id));
    try {
      const dismissed = JSON.parse(localStorage.getItem("flashportal-dismissed-notifications") || "[]");
      localStorage.setItem("flashportal-dismissed-notifications", JSON.stringify(Array.from(new Set([...dismissed, id]))));
    } catch {}
  }

  async function loadSubmissionQueue() {
    const { data, error } = await supabase
      .from("game_submissions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      setToast("Run V54 SQL once, then reload");
      setTimeout(() => setToast(""), 2500);
      return;
    }

    setSubmissions(data || []);
    setSubmissionQueue(data || []);
    setToast((data || []).length ? "Submission queue loaded" : "No pending submissions");
    setTimeout(() => setToast(""), 2000);
  }

  useEffect(() => {
    localStorage.setItem(getScopedKey("flashportal-friends", user?.email), JSON.stringify(friends));
  }, [friends, user?.email]);

  useEffect(() => {
    localStorage.setItem(getScopedKey("flashportal-friend-requests", user?.email), JSON.stringify(friendRequests));
  }, [friendRequests, user?.email]);

  useEffect(() => {
    if (!user?.email) return;

    async function loadFriendsBackend() {
      const email = user.email.toLowerCase();
      const { data, error } = await supabase
        .from("friend_requests")
        .select("id, sender_email, target, status, created_at")
        .or(`target.eq.${email},sender_email.eq.${email}`)
        .order("created_at", { ascending: false });

      if (error || !Array.isArray(data)) return;

      const received = data
        .filter((row) => String(row.status || "pending") === "pending" && String(row.target || "").toLowerCase() === email)
        .map((row) => ({ id: row.id, from: row.sender_email || "Unknown player" }));

      const sent = data
        .filter((row) => String(row.status || "pending") === "pending" && String(row.sender_email || "").toLowerCase() === email)
        .map((row) => ({ id: row.id, target: row.target || "Unknown player", status: "Pending" }));

      const accepted = data
        .filter((row) => String(row.status || "") === "accepted")
        .map((row) => String(row.sender_email || "").toLowerCase() === email ? row.target : row.sender_email)
        .filter(Boolean);

      setFriendRequests(received);
      setSentFriendRequests(sent);
      setFriends((current) => Array.from(new Set([...current, ...accepted])));
    }

    loadFriendsBackend();
  }, [user?.email]);

  async function sendFriendRequest() {
    const target = friendLookup.trim();
    if (!target) return;

    const currentEmail = user?.email || "";
    if (target.toLowerCase() === currentEmail.toLowerCase()) {
      setToast("You cannot send a friend request to yourself");
      setTimeout(() => setToast(""), 2000);
      return;
    }

    if (friends.some((friend) => friend.toLowerCase() === target.toLowerCase())) {
      setToast("Already on your friends list");
      setTimeout(() => setToast(""), 2000);
      return;
    }

    const optimisticRequest = { id: `local-${Date.now()}`, target, status: "Pending" };
    setSentFriendRequests((current) =>
      current.some((request) => String(request.target || request).toLowerCase() === target.toLowerCase())
        ? current
        : [...current, optimisticRequest]
    );

    const { data } = await supabase.from("friend_requests").insert({
      sender_id: user?.id || null,
      sender_email: user?.email || "",
      target: target.toLowerCase(),
      status: "pending",
    }).select("id, target, status").single();

    if (data?.id) {
      setSentFriendRequests((current) => current.map((request) => request.id === optimisticRequest.id ? { id: data.id, target: data.target, status: "Pending" } : request));
    }

    setFriendLookup("");
    setToast("Friend request sent");
    setTimeout(() => setToast(""), 2000);
  }

  async function acceptFriend(request) {
    const friendEmail = request?.from || request;
    if (request?.id) {
      await supabase.from("friend_requests").update({ status: "accepted", updated_at: new Date().toISOString() }).eq("id", request.id);
    }
    setFriends((current) => current.some((friend) => friend.toLowerCase() === String(friendEmail).toLowerCase()) ? current : [...current, friendEmail]);
    setFriendRequests((current) => current.filter((item) => (item?.id || item) !== (request?.id || request)));
  }

  async function declineFriend(request) {
    if (request?.id) {
      await supabase.from("friend_requests").update({ status: "declined", updated_at: new Date().toISOString() }).eq("id", request.id);
    }
    setFriendRequests((current) => current.filter((item) => (item?.id || item) !== (request?.id || request)));
  }

  function unfriend(target) {
    setFriends((current) => current.filter((friend) => friend.toLowerCase() !== target.toLowerCase()));
    setToast(`Removed ${target} from friends`);
    setTimeout(() => setToast(""), 2000);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(getPlaylistKey(user?.email), JSON.stringify(playlistIds));
  }, [playlistIds, user?.email]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(getCreatorFollowKey(user?.email), JSON.stringify(followedCreators));
  }, [followedCreators, user?.email]);

  useEffect(() => {
    if (!user?.email) return;

    async function loadCreatorFollows() {
      try {
        const { data, error } = await supabase
          .from("creator_follows")
          .select("username")
          .eq("follower_email", user.email.toLowerCase());

        if (!error && Array.isArray(data)) {
          const remote = data.map((row) => row.username).filter(Boolean);
          setFollowedCreators((current) => Array.from(new Set([...current, ...remote])));
        }
      } catch {}
    }

    loadCreatorFollows();
  }, [user?.email]);

  useEffect(() => {
    async function loadCreatorFollowerCounts() {
      try {
        const { data, error } = await supabase
          .from("creator_follows")
          .select("username");

        if (!error && Array.isArray(data)) {
          const counts = {};
          data.forEach((row) => {
            if (!row.username) return;
            counts[row.username] = (counts[row.username] || 0) + 1;
          });
          setCreatorFollowerCounts(counts);
        }
      } catch {}
    }

    loadCreatorFollowerCounts();
  }, [followedCreators]);

  useEffect(() => {
    function syncPlaylistFromStorage() {
      try {
        setPlaylistIds(JSON.parse(localStorage.getItem(getPlaylistKey(user?.email)) || "[]"));
      } catch {}
    }
    window.addEventListener("flashportal-playlist-changed", syncPlaylistFromStorage);
    return () => window.removeEventListener("flashportal-playlist-changed", syncPlaylistFromStorage);
  }, [user?.email]);

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

  const playlistGames = publicGames.filter((game) => playlistIds.includes(game.id));

  const creatorProfiles = useMemo(() => {
    const grouped = new Map();

    publicGames.forEach((game) => {
      const creatorName = game.creator || (game.official ? "FlashDust" : "FlashPortal Creator");
      const slug = creatorSlug(creatorName);
      const existing = grouped.get(slug) || {
        slug,
        name: creatorName,
        avatar: avatarInitials(creatorName),
        bio: creatorName === "FlashDust"
          ? "Official FlashPortal creator building sports sims, guessing games, and platform originals."
          : "FlashPortal creator sharing browser games with the community.",
        games: [],
        totalPlays: 0,
        ratingTotal: 0,
        ratingCount: 0,
        baseFollowers: 0,
        official: creatorName === "FlashDust",
      };

      const rating = Number(game.rating || 0);
      existing.games.push(game);
      existing.totalPlays += parsePlayCount(game.plays);
      if (rating > 0) {
        existing.ratingTotal += rating;
        existing.ratingCount += 1;
      }
      grouped.set(slug, existing);
    });

    return Array.from(grouped.values())
      .map((creator) => ({
        ...creator,
        followers: Number(creatorFollowerCounts[creator.slug] || 0),
        averageRating: creator.ratingCount ? (creator.ratingTotal / creator.ratingCount).toFixed(1) : "New",
        games: sortNewest(creator.games),
      }))
      .sort((a, b) => b.totalPlays - a.totalPlays || b.games.length - a.games.length);
  }, [publicGames, followedCreators, creatorFollowerCounts]);

  async function toggleCreatorFollow(profile) {
    if (!user?.email) {
      setToast("Log in first to follow creators");
      setTimeout(() => setToast(""), 2200);
      return;
    }

    const isFollowing = followedCreators.includes(profile.slug);
    setFollowedCreators((current) => isFollowing
      ? current.filter((slug) => slug !== profile.slug)
      : [...current, profile.slug]
    );
    setCreatorFollowerCounts((current) => ({
      ...current,
      [profile.slug]: Math.max(0, Number(current[profile.slug] || 0) + (isFollowing ? -1 : 1)),
    }));

    try {
      if (isFollowing) {
          await supabase
            .from("creator_follows")
            .delete()
            .eq("username", profile.slug)
            .eq("follower_email", user.email.toLowerCase());
        } else {
          await supabase.from("creator_follows").upsert({
            username: profile.slug,
            creator_name: profile.name,
            follower_id: user.id || null,
            follower_email: user.email.toLowerCase(),
          }, { onConflict: "username,follower_email" });
      }
    } catch {}

    setToast(isFollowing ? `Unfollowed ${profile.name}` : `Following ${profile.name}`);
    setTimeout(() => setToast(""), 1800);
  }

  const totalPlays = publicGames.reduce((sum, game) => sum + parsePlayCount(game.plays), 0);

  useEffect(() => {
    if (!recentlyPlayed.length) return;
    setContinueDockOpen(true);
    const continueDockTimer = setTimeout(() => setContinueDockOpen(false), 7000);
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
    const playable = publicGames.filter((game) => game.playable);
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
  { id: "creators", label: "Creators", icon: User },
  { id: "friends", label: "Friends", icon: Users },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "updates", label: "Updates", icon: Newspaper },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "publish", label: "Publish", icon: Upload, highlight: true },
    { id: "creatorHub", label: "Creator Hub", icon: Sparkles },
    { id: "settings", label: "Profile", icon: Settings },
    ...(userIsAdmin ? [{ id: "admin", label: userIsOwner ? "Owner" : "Admin", icon: Shield }] : []),
  ];

  function playUISound(type = "click") {
    if (!audioEnabled || uiVolume <= 0 || typeof window === "undefined") return;

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

      gain.gain.setValueAtTime(sound.volume * Math.max(0, Math.min(1, uiVolume)), now);
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
      const startVolume = musicVolume <= 0 ? 0.35 : musicVolume;
      if (musicVolume <= 0) setMusicVolume(startVolume);
      master.gain.value = 0.028 * Math.max(0, Math.min(1, startVolume));
      window.__flashPortalMusicGain = master;
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
        window.__flashPortalMusicGain = null;
      };

      playStep();
      setMusicEnabled(true);
      playUISound("success");
    } catch {}
  }

  function handleTabChange(tabId) {
    playUISound("tab");

    const realRoutes = {
      settings: "/profile",
      creatorHub: "/creator-hub",
      creators: "/creators",
      about: "/about",
      account: "/profile",
      profile: "/profile",
      messages: "/messages",
    };

    if (realRoutes[tabId] && typeof window !== "undefined") {
      window.location.href = realRoutes[tabId];
      return;
    }

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

  async function persistGameVisibility(gameId, changes) {
    const nextEntry = { ...(gameVisibility[gameId] || {}), ...changes };
    const nextVisibility = { ...gameVisibility, [gameId]: nextEntry };
    setGameVisibility(nextVisibility);
    localStorage.setItem("flashportal-game-visibility", JSON.stringify(nextVisibility));

    try {
      await supabase.from("game_visibility").upsert({
        game_id: gameId,
        hidden: Boolean(nextEntry.hidden),
        deleted: Boolean(nextEntry.deleted),
        updated_by: user?.id || null,
        updated_by_email: user?.email || "",
        updated_at: new Date().toISOString(),
      }, { onConflict: "game_id" });
    } catch {}
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
          <strong>V69 Online</strong>
          <p>Fixed creator profile 404 caused by old creator_slug lookup; Guess The Word update kept.</p>
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
                {(notifications.length + friendRequests.length) > 0 && <span className="notification-badge">{notifications.length + friendRequests.length}</span>}
              </button>

              {notificationsOpen && (
                <div className="notification-panel">
                  <strong>Notifications</strong>
                  {(notifications.length + friendRequests.length) === 0 ? (
                    <p>No new alerts yet.</p>
                  ) : (
                    <div className="notification-list">
                      {friendRequests.map((request) => (
                        <article className="notification-item" key={`friend-${request?.id || request}`}>
                          <div>
                            <b>New friend request</b>
                            <p>{request?.from || request} wants to add you.</p>
                          </div>
                          <button type="button" onClick={() => acceptFriend(request)}>Accept</button>
                          <button type="button" onClick={() => declineFriend(request)}>Decline</button>
                        </article>
                      ))}
                      {notifications.map((note) => (
                        <article className="notification-item" key={note.id}>
                          <div>
                            <b>{note.title || "FlashPortal Update"}</b>
                            <p>{note.body || note.text || ""}</p>
                            {note.created_at && <small>{new Date(note.created_at).toLocaleString()}</small>}
                          </div>
                          <button type="button" onClick={() => deleteNotification(note.id)} aria-label="Delete notification">×</button>
                        </article>
                      ))}
                    </div>
                  )}
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
                  <button type="button" onClick={() => handleTabChange("profile")}>
                    <User size={16} /> Profile Editor
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
              <Stat icon={Gamepad2} value={publicGames.length} label="Playable Games" />
              <Stat icon={Cloud} value={recentlyPlayed.length} label="Cloud Saves" />
              <Stat icon={Trophy} value="0" label="Achievements" />
              <Stat icon={Star} value={averageRating} label="Avg Rating" />
              <Stat icon={Flame} value={formatNumber(totalPlays)} label="Plays" />
            </div>

            <GameRow title="Trending Now" icon={Flame} games={trendingGames} onPlay={launchGame} />
            <GameRow title="New Releases" icon={Zap} games={sortNewest(filteredGames.filter((game) => game.status === "New Release"))} onPlay={launchGame} />
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
                <h3>Your first 3 game submissions are free.</h3>
                <p>
                  Upload up to 3 games for free, add thumbnails and descriptions, and send them into review.
                  Paid options are for extra submissions after that and featured placement only.
                </p>
                <div className="creator-studio-actions">
                  <a className="primary-link-button" href="/creator/upload">Upload Game</a>
                  <a className="secondary-link-button" href="/creator-checkout">View Paid Options</a>
                </div>
              </article>

              <article className="creator-plan-card free">
                <strong>$0</strong>
                <h3>3 Free Game Uploads</h3>
                <p>Submit up to 3 FlashPortal browser games without checkout.</p>
                <span>Best for new creators</span>
              </article>

              <article className="creator-plan-card">
                <strong>$1.99</strong>
                <h3>Extra Upload</h3>
                <p>Submit another browser game for review after your 3 free uploads are used.</p>
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
                  <GameCard key={game.id} game={game} onPlay={() => launchGame(game)} />
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


        {activeTab === "creators" && (
          <section className="portal-view creator-profiles-section">
            <SectionHeader
              label="Creator Update"
              title="Creator Profiles"
              text="Each creator now gets a public-style profile with avatar, banner, bio, uploaded games, followers, total plays, and average rating."
            />

            <div className="creator-profile-grid">
              {creatorProfiles.map((profile) => {
                const isFollowing = followedCreators.includes(profile.slug);
                return (
                  <article className={`creator-profile-card ${profile.official ? "official" : ""}`} key={profile.slug}>
                    <div className="creator-banner">
                      <div className="creator-avatar">{profile.avatar}</div>
                      {profile.official && <span>FlashPortal Original</span>}
                    </div>

                    <div className="creator-profile-body">
                      <div className="creator-profile-title-row">
                        <div>
                          <h3>{profile.name}</h3>
                          <p>{profile.bio}</p>
                        </div>
                        <button type="button" onClick={() => toggleCreatorFollow(profile)} className={isFollowing ? "following" : ""}>
                          {isFollowing ? "Following" : "Follow"}
                        </button>
                      </div>

                      <div className="creator-profile-stats">
                        <span><strong>{profile.games.length}</strong> Games</span>
                        <span><strong>{formatNumber(profile.followers)}</strong> Followers</span>
                        <span><strong>{formatNumber(profile.totalPlays)}</strong> Plays</span>
                        <span><strong>{profile.averageRating}</strong> Avg Rating</span>
                      </div>

                      <div className="creator-game-strip">
                        {profile.games.slice(0, 4).map((game) => (
                          <button key={game.id} type="button" onClick={() => launchGame(game)}>
                            <img src={game.thumbnail} alt="" />
                            <span>{game.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}


        {activeTab === "friends" && (
          <section className="tab-section friends-section">
            <div className="section-heading">
              <div>
                <span>Social</span>
                <h2>Friends</h2>
                <p>Add players by username or email. Sent requests stay separate from requests you receive.</p>
              </div>
            </div>

            <article className="friend-add-card">
              <h3>Add Friend</h3>
              <p>Enter a username or email.</p>
              <div className="friend-add-row">
                <input value={friendLookup} onChange={(event) => setFriendLookup(event.target.value)} placeholder="username or email@example.com" />
                <button type="button" onClick={sendFriendRequest}>Send Request</button>
              </div>
            </article>

            <div className="friend-grid v46-friend-grid">
              <article>
                <h3>Received Requests</h3>
                {friendRequests.length ? (
                  friendRequests.map((request) => (
                    <div className="friend-row" key={request?.id || request}>
                      <span>{request?.from || request}</span>
                      <button type="button" onClick={() => acceptFriend(request)}>Accept</button>
                      <button type="button" onClick={() => declineFriend(request)}>Decline</button>
                    </div>
                  ))
                ) : (
                  <p>No received friend requests yet.</p>
                )}
              </article>

              <article>
                <h3>Sent Requests</h3>
                {sentFriendRequests.length ? (
                  sentFriendRequests.map((request) => <div className="friend-row" key={request?.id || request}><span>{request?.target || request}</span><small>{request?.status || "Pending"}</small></div>)
                ) : (
                  <p>No sent requests yet.</p>
                )}
              </article>

              <article>
                <h3>Friends List</h3>
                {friends.length ? (
                  friends.map((friend) => <div className="friend-row" key={friend}><span>{friend}</span><button className="danger" type="button" onClick={() => unfriend(friend)}>Unfriend</button></div>)
                ) : (
                  <p>No friends added yet.</p>
                )}
              </article>
            </div>
          </section>
        )}


        {activeTab === "creatorHub" && (
          <section className="portal-view creator-hub-section">
            <SectionHeader
              label="FlashPortal Labs"
              title="Creator and community roadmap"
              text="The next layer is making FlashPortal feel alive: profiles, challenges, creator follows, badges, and better discovery."
            />
            <div className="idea-grid">
              <article><Sparkles size={26} /><h3>Creator Profiles</h3><p>Avatar, banner, bio, uploaded games, followers, total plays, and average rating.</p></article>
              <article><Flame size={26} /><h3>Weekly Trending</h3><p>Trending Today, This Week, and This Month so the homepage rotates more fairly.</p></article>
              <article><Zap size={26} /><h3>Daily Challenge</h3><p>A featured daily game/task with XP, streaks, and limited badges.</p></article>
              <article><Trophy size={26} /><h3>Levels and Badges</h3><p>Earn profile XP for playing, reviewing, uploading, saving games, and helping creators.</p></article>
              <article><Heart size={26} /><h3>Wishlist + Playlist</h3><p>Playlist for saved games, wishlist for upcoming games and launch notifications.</p></article>
              <article><Users size={26} /><h3>Follow Creators</h3><p>Get notifications when a creator uploads, updates, or launches a new game.</p></article>
            </div>
            <div className="spotlight-grid">
              <article className="creator-spotlight-card">
                <span>Featured Creator</span>
                <h3>FlashDust</h3>
                <p>Original sports sims, guessing games, and FlashPortal platform updates.</p>
                <strong>{publicGames.filter((game) => game.official).length} originals</strong>
              </article>
              <article className="daily-challenge-card">
                <span>Daily Challenge</span>
                <h3>Play one new release</h3>
                <p>Try a game you have not played today and leave a review to help the creator.</p>
                <button type="button" onClick={() => launchGame(sortNewest(publicGames)[0] || publicGames[0])}>Start Challenge</button>
              </article>
            </div>
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

              <article className="settings-card audio-settings-card">
                <Volume2 size={28} />
                <h3>Audio</h3>
                <p>Control click sounds and background music. 0% is fully muted.</p>
                <label className="volume-control">
                  UI Click Volume: {Math.round(uiVolume * 100)}%
                  <input type="range" min="0" max="1" step="0.01" value={uiVolume} onChange={(event) => setUiVolume(Number(event.target.value))} />
                </label>
                <label className="volume-control">
                  Music Volume: {Math.round(musicVolume * 100)}%
                  <input type="range" min="0" max="1" step="0.01" value={musicVolume} onChange={(event) => setMusicVolume(Number(event.target.value))} />
                </label>
                <button type="button" onClick={toggleBackgroundMusic}>{musicEnabled ? "Stop Music" : "Play Music"}</button>
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
                <p>Send a real platform announcement. It appears in every user notification menu after V54 SQL is run.</p>
                <textarea value={announcementDraft} onChange={(event) => setAnnouncementDraft(event.target.value)} placeholder="Example: FlashPortal V38 is live with owner tools and game management." />
                <button type="button" onClick={() => { playUISound("success"); sendAnnouncementNow(); }}>
                  Send Announcement
                </button>
              </article>

              <article className="admin-card wide">
                <Gamepad2 size={32} />
                <h3>Game Management</h3>
                <p>Edit text, hide/private games, or remove games from the live list.</p>
                <div className="admin-game-list">
                  {managedGames.filter((game) => !gameVisibility[game.id]?.deleted).map((game) => (
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
                        persistGameVisibility(game.id, { hidden: game.playable !== false });
                        setManagedGames((current) => current.map((item) => item.id === game.id ? { ...item, playable: item.playable === false, status: item.playable === false ? "Playable" : "Private" } : item));
                      }}>
                        {game.playable ? "Private" : "Public"}
                      </button>
                      <button className="danger" type="button" onClick={() => {
                        if (window.confirm(`Delete ${game.title} from the live game list? This now persists after refresh.`)) {
                          persistGameVisibility(game.id, { hidden: true, deleted: true });
                          if (game.submissionId) {
                            supabase.from("game_submissions").update({ status: "deleted", updated_at: new Date().toISOString() }).eq("id", game.submissionId).then(() => {});
                          }
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
                      <small>If someone submitted a game and this is empty, run the V53 SQL so owner/admin read policies are active.</small>
                      <button type="button" onClick={loadSubmissionQueue}>Load Queue</button>
                    </>
                  ) : (
                    submissions.map((submission) => (
                      <div className="submission-row" key={submission.id}>
                        <strong>{submission.title || submission.game_title || "Untitled Game"}</strong>
                        <small>{submission.category || "Uncategorized"} · {submission.status || "pending"}</small>
                        <p>{submission.description || "No description."}</p>
                        <div className="admin-button-row">
                          <button type="button" onClick={async () => {
                            const approvedGame = submissionToGame({ ...submission, status: "approved" });
                            const { error } = await supabase.from("game_submissions").update({ status: "approved", updated_at: new Date().toISOString() }).eq("id", submission.id);
                            if (error) {
                              setToast(`Accept failed: ${error.message}`);
                              return;
                            }
                            await persistGameVisibility(approvedGame.id, { hidden: false, deleted: false });
                            setManagedGames((current) => current.some((game) => game.id === approvedGame.id) ? current.map((game) => game.id === approvedGame.id ? approvedGame : game) : [...current, approvedGame]);
                            setSubmissions((current) => current.filter((item) => item.id !== submission.id));
                            setSubmissionQueue((current) => current.filter((item) => item.id !== submission.id));
                            setToast(`${approvedGame.title} published`);
                          }}>Accept</button>
                          <button className="danger" type="button" onClick={async () => {
                            const { error } = await supabase.from("game_submissions").update({ status: "declined", updated_at: new Date().toISOString() }).eq("id", submission.id);
                            if (error) {
                              setToast(`Decline failed: ${error.message}`);
                              return;
                            }
                            setSubmissions((current) => current.filter((item) => item.id !== submission.id));
                            setSubmissionQueue((current) => current.filter((item) => item.id !== submission.id));
                            setToast("Submission declined");
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
                  <small className="admin-note">Saved admins go into Supabase admin_roles after you run the V53 SQL.</small>
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
        <div className="game-action-row"><SaveGameButton gameId={game.id} /><a className="review-action-button" href={`/reviews/${game.id}`}>⭐ Review / Rate</a></div>
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
        <div className="game-action-row">
          <SaveGameButton gameId={game.id} />
          <a className="review-action-button" href={`/reviews/${game.id}`}>
            <Star size={15} /> Review / Rate
          </a>
        </div>
        <button type="button" onClick={onPlay}>
          <Play size={15} /> Play
        </button>
      </div>
    </article>
  );
}


function SaveGameButton({ gameId }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem(getPlaylistKey()) || "[]");
      setSaved(ids.includes(gameId));
    } catch {}
  }, [gameId]);

  function toggleSaved() {
    let ids = [];
    try {
      ids = JSON.parse(localStorage.getItem(getPlaylistKey()) || "[]");
    } catch {}
    const next = ids.includes(gameId) ? ids.filter((id) => id !== gameId) : [...ids, gameId];
    localStorage.setItem(getPlaylistKey(), JSON.stringify(next));
    setSaved(next.includes(gameId));
    window.dispatchEvent(new Event("flashportal-playlist-changed"));
  }

  return (
    <button className={`heart-save-button ${saved ? "saved" : ""}`} type="button" onClick={toggleSaved} aria-label={saved ? "Remove from Playlist" : "Add to Playlist"}>
      <Heart size={16} fill={saved ? "currentColor" : "none"} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
