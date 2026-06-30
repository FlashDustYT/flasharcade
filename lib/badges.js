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
