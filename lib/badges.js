export const BADGE_DEFINITIONS = [
  { code: "flashportal_pioneer", label: "FlashPortal Pioneer", title: "FlashPortal Pioneer", rarity: "Legacy", description: "Joined FlashPortal during the Early Build before the official completed release.", unlock_hint: "Create an account before the official release.", points: 1000, category: "legacy" },
  { code: "early_player", label: "Early Player", title: "Early Player", rarity: "Legacy", description: "Joined FlashPortal during the early build.", unlock_hint: "Create an account during beta.", points: 900, category: "legacy" },
  { code: "profile_started", label: "Profile Started", title: "Profile Started", rarity: "Common", description: "Saved your FlashPortal profile.", unlock_hint: "Save your profile.", points: 10, category: "profile" },
  { code: "profile_pic", label: "Profile Picture", title: "Profile Picture", rarity: "Common", description: "Added a profile picture.", unlock_hint: "Add a profile picture.", points: 10, category: "profile" },
  { code: "bio_added", label: "Bio Added", title: "Bio Added", rarity: "Common", description: "Added a bio to your profile.", unlock_hint: "Add a profile bio.", points: 10, category: "profile" },
  { code: "first_post", label: "First Post", title: "First Post", rarity: "Common", description: "Posted your first profile update.", unlock_hint: "Post an update.", points: 20, category: "social" },
  { code: "first_comment", label: "First Comment", title: "First Comment", rarity: "Common", description: "Commented on a community post.", unlock_hint: "Comment on a post.", points: 20, category: "social" },
  { code: "first_like", label: "First Reaction", title: "First Reaction", rarity: "Common", description: "Reacted to a community post.", unlock_hint: "Like or dislike a post.", points: 20, category: "social" },
  { code: "first_message", label: "First Message", title: "First Message", rarity: "Uncommon", description: "Sent your first direct message.", unlock_hint: "Send a message.", points: 40, category: "social" },
  { code: "first_rating", label: "First Rating", title: "First Rating", rarity: "Common", description: "Rated your first game.", unlock_hint: "Rate any game.", points: 20, category: "games" },
  { code: "first_review", label: "First Review", title: "First Review", rarity: "Uncommon", description: "Wrote your first public review.", unlock_hint: "Write a review.", points: 40, category: "games" },
  { code: "first_save", label: "First Save", title: "First Save", rarity: "Common", description: "Saved your first game.", unlock_hint: "Save any game.", points: 20, category: "games" },
  { code: "creator_start", label: "Creator Start", title: "Creator Start", rarity: "Uncommon", description: "Uploaded at least one approved game.", unlock_hint: "Upload a game.", points: 50, category: "creator" },
  { code: "rising_creator", label: "Rising Creator", title: "Rising Creator", rarity: "Rare", description: "Reached 5 followers.", unlock_hint: "Reach 5 followers.", points: 150, category: "creator" },
  { code: "hot_game", label: "Hot Game", title: "Hot Game", rarity: "Rare", description: "A published game reached 25 total plays.", unlock_hint: "Help a game reach 25 plays.", points: 150, category: "creator" },
  { code: "how_many_rings_first_run", label: "How Many Rings Rookie", title: "How Many Rings Rookie", rarity: "Common", description: "Started a dynasty in How Many Rings.", unlock_hint: "Play How Many Rings once.", points: 25, category: "game", game_id: "how-many-rings" },
  { code: "how_many_rings_dynasty", label: "Dynasty Builder", title: "Dynasty Builder", rarity: "Rare", description: "Built a serious title window in How Many Rings.", unlock_hint: "Win 3+ rings in How Many Rings.", points: 200, category: "game", game_id: "how-many-rings" },
  { code: "how_many_rings_perfect_decade", label: "Perfect Decade", title: "Perfect Decade", rarity: "Legendary", description: "Won all 10 rings in the 10-year title window.", unlock_hint: "Win 10 rings in How Many Rings. Any mode counts.", points: 500, category: "game", game_id: "how-many-rings" },
  { code: "legacy_league_first_snap", label: "First Snap", title: "First Snap", rarity: "Common", description: "Started a Legacy League career.", unlock_hint: "Play Legacy League once.", points: 25, category: "game", game_id: "legacy-league" },
  { code: "legacy_league_champion", label: "League Champion", title: "League Champion", rarity: "Epic", description: "Built a championship-level Legacy League save.", unlock_hint: "Win big in Legacy League.", points: 350, category: "game", game_id: "legacy-league" },
  { code: "guess_word_solver", label: "Word Solver", title: "Word Solver", rarity: "Common", description: "Solved your first Guess The Word puzzle.", unlock_hint: "Play Guess The Word.", points: 25, category: "game", game_id: "guess-the-word" },
  { code: "guess_word_streak", label: "Word Streak", title: "Word Streak", rarity: "Rare", description: "Built a real Guess The Word streak.", unlock_hint: "Keep winning Guess The Word rounds.", points: 200, category: "game", game_id: "guess-the-word" },
  { code: "guess_celeb_spotter", label: "Celeb Spotter", title: "Celeb Spotter", rarity: "Common", description: "Guessed your first celebrity correctly.", unlock_hint: "Play Guess The Celeb.", points: 25, category: "game", game_id: "guess-the-celeb" },
  { code: "guess_celeb_master", label: "Celeb Mastermind", title: "Celeb Mastermind", rarity: "Epic", description: "Dominated Guess The Celeb clues.", unlock_hint: "Win difficult Guess The Celeb rounds.", points: 350, category: "game", game_id: "guess-the-celeb" },
];

export const DEFAULT_GAME_ACHIEVEMENTS = BADGE_DEFINITIONS.filter((badge) => badge.category === "game");

export const RARITY_ORDER = ["Legacy", "Mythic", "Legendary", "Epic", "Rare", "Uncommon", "Common"];

export function normalizeRarity(rarity = "Common") {
  const value = String(rarity || "Common").toLowerCase();
  return RARITY_ORDER.find((item) => item.toLowerCase() === value) || "Common";
}

export function rarityRank(rarity) {
  const normalized = normalizeRarity(rarity);
  const index = RARITY_ORDER.indexOf(normalized);
  return index === -1 ? RARITY_ORDER.length : index;
}

export async function awardBadge(supabase, userId, code) {
  if (!userId || !code) return false;
  try {
    const { error } = await supabase.from("user_badges").upsert({ user_id: userId, badge_code: code }, { onConflict: "user_id,badge_code" });
    return !error;
  } catch {
    return false;
  }
}

export async function awardEarlyBuildBadges(supabase, userId) {
  if (!userId) return;
  const primary = await awardBadge(supabase, userId, "flashportal_pioneer");
  if (!primary) await awardBadge(supabase, userId, "early_player");
  await awardBadge(supabase, userId, "profile_started");
}

export function badgeInfo(code) {
  const local = BADGE_DEFINITIONS.find((badge) => badge.code === code);
  if (local) return local;
  return { code, label: String(code || "Badge").replaceAll("_", " "), title: String(code || "Badge").replaceAll("_", " "), rarity: "Common", description: "FlashPortal badge." };
}

export function normalizeBadgeRow(row) {
  const code = row?.badge_code || row?.code;
  const catalog = row?.achievement_catalog || row?.catalog || null;
  const local = badgeInfo(code);
  const title = catalog?.title || row?.title || local.title || local.label;
  return {
    ...local,
    ...catalog,
    ...row,
    code,
    badge_code: code,
    title,
    label: title,
    rarity: normalizeRarity(catalog?.rarity || row?.rarity || local.rarity),
    description: catalog?.description || row?.description || local.description || "FlashPortal badge.",
    unlock_hint: catalog?.unlock_hint || row?.unlock_hint || local.unlock_hint || "Keep using FlashPortal.",
    points: Number(catalog?.points ?? row?.points ?? local.points ?? 10),
    earned: Boolean(row?.earned ?? row?.earned_at),
    earned_at: row?.earned_at || null,
  };
}
