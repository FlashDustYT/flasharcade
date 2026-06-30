export const BADGE_DEFINITIONS = [
  { code: "early_player", label: "Early Player", rarity: "Common", description: "Joined FlashPortal during the early build." },
  { code: "first_post", label: "First Post", rarity: "Common", description: "Posted your first profile update." },
  { code: "first_rating", label: "First Rating", rarity: "Common", description: "Rated your first game." },
  { code: "creator_start", label: "Creator Start", rarity: "Uncommon", description: "Uploaded at least one approved game." },
  { code: "social_spark", label: "Social Spark", rarity: "Uncommon", description: "Reached 1 follower." },
  { code: "rising_creator", label: "Rising Creator", rarity: "Rare", description: "Reached 5 followers." },
  { code: "hot_game", label: "Hot Game", rarity: "Rare", description: "A game reached 25 total plays." },
];

export async function awardBadge(supabase, userId, code) {
  if (!userId || !code) return;
  try {
    await supabase.from("user_badges").upsert({ user_id: userId, badge_code: code }, { onConflict: "user_id,badge_code" });
  } catch {}
}

export function badgeInfo(code) {
  return BADGE_DEFINITIONS.find((badge) => badge.code === code) || { code, label: code, rarity: "Common", description: "" };
}


// Build fix: older/newer badges pages import this name.
// Keep it exported so /app/badges/page.jsx can prerender safely.
export const DEFAULT_GAME_ACHIEVEMENTS = [
  {
    code: "first_run",
    title: "First Run",
    label: "First Run",
    rarity: "Common",
    description: "Play this game once.",
    unlock_hint: "Play this game once.",
    game_id: null,
    points: 10,
  },
  {
    code: "getting_warm",
    title: "Getting Warm",
    label: "Getting Warm",
    rarity: "Common",
    description: "Play this game 5 times.",
    unlock_hint: "Play this game 5 times.",
    game_id: null,
    points: 20,
  },
  {
    code: "locked_in",
    title: "Locked In",
    label: "Locked In",
    rarity: "Uncommon",
    description: "Play this game 10 times.",
    unlock_hint: "Play this game 10 times.",
    game_id: null,
    points: 40,
  },
  {
    code: "leave_a_rating",
    title: "Leave a Rating",
    label: "Leave a Rating",
    rarity: "Common",
    description: "Rate this game.",
    unlock_hint: "Rate this game.",
    game_id: null,
    points: 10,
  },
  {
    code: "big_fan",
    title: "Big Fan",
    label: "Big Fan",
    rarity: "Uncommon",
    description: "Give this game 5 stars.",
    unlock_hint: "Give this game 5 stars.",
    game_id: null,
    points: 50,
  },
  {
    code: "real_feedback",
    title: "Real Feedback",
    label: "Real Feedback",
    rarity: "Uncommon",
    description: "Write a review for this game.",
    unlock_hint: "Write a review for this game.",
    game_id: null,
    points: 50,
  },
  {
    code: "keep_it_close",
    title: "Keep It Close",
    label: "Keep It Close",
    rarity: "Common",
    description: "Save this game to your playlist.",
    unlock_hint: "Save this game to your playlist.",
    game_id: null,
    points: 10,
  },
  {
    code: "hot_start",
    title: "Hot Start",
    label: "Hot Start",
    rarity: "Rare",
    description: "Help this game reach 25 total plays.",
    unlock_hint: "Help this game reach 25 total plays.",
    game_id: null,
    points: 100,
  },
  {
    code: "crowd_favorite",
    title: "Crowd Favorite",
    label: "Crowd Favorite",
    rarity: "Epic",
    description: "Help this game reach a 4.5 average rating.",
    unlock_hint: "Help this game reach a 4.5 average rating.",
    game_id: null,
    points: 200,
  },
];

