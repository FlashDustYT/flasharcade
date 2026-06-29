export const BADGE_DEFINITIONS = [
  // Common
  { code: "early_player", label: "Early Player", rarity: "Common", description: "Joined FlashPortal during the early build." },
  { code: "profile_started", label: "Profile Started", rarity: "Common", description: "Saved your profile." },
  { code: "first_post", label: "First Post", rarity: "Common", description: "Posted your first update." },
  { code: "first_rating", label: "First Rating", rarity: "Common", description: "Rated your first game." },
  { code: "first_review", label: "First Review", rarity: "Common", description: "Wrote your first review." },
  { code: "first_save", label: "First Save", rarity: "Common", description: "Saved your first game." },
  { code: "first_message", label: "First Message", rarity: "Common", description: "Sent your first message." },
  { code: "first_friend", label: "First Friend", rarity: "Common", description: "Added your first friend." },
  { code: "welcome_creator", label: "Welcome Creator", rarity: "Common", description: "Opened the creator tools." },
  { code: "profile_pic", label: "Fresh Face", rarity: "Common", description: "Added a profile picture." },
  { code: "bio_added", label: "Bio Writer", rarity: "Common", description: "Added a bio." },
  { code: "theme_switcher", label: "Theme Switcher", rarity: "Common", description: "Changed your theme." },
  { code: "daily_visit", label: "Daily Visit", rarity: "Common", description: "Visited FlashPortal today." },
  { code: "first_play", label: "First Play", rarity: "Common", description: "Played your first game." },
  { code: "three_plays", label: "Triple Tap", rarity: "Common", description: "Played 3 games." },
  { code: "five_plays", label: "Five Run", rarity: "Common", description: "Played 5 games." },
  { code: "first_upload", label: "First Upload", rarity: "Common", description: "Submitted your first game." },

  // Uncommon
  { code: "creator_start", label: "Creator Start", rarity: "Uncommon", description: "Got one approved game." },
  { code: "social_spark", label: "Social Spark", rarity: "Uncommon", description: "Reached 1 follower." },
  { code: "active_chatter", label: "Active Chatter", rarity: "Uncommon", description: "Sent 10 messages." },
  { code: "playlist_builder", label: "Playlist Builder", rarity: "Uncommon", description: "Saved 5 games." },
  { code: "reviewer", label: "Reviewer", rarity: "Uncommon", description: "Posted 5 ratings/reviews." },
  { code: "two_posts", label: "Posting Up", rarity: "Uncommon", description: "Posted 2 updates." },
  { code: "five_posts", label: "Feed Regular", rarity: "Uncommon", description: "Posted 5 updates." },
  { code: "two_games", label: "Double Drop", rarity: "Uncommon", description: "Uploaded 2 approved games." },
  { code: "three_games", label: "Free Trilogy", rarity: "Uncommon", description: "Used all 3 free game uploads." },
  { code: "ten_plays", label: "Ten Plays", rarity: "Uncommon", description: "Played games 10 times." },
  { code: "twenty_plays", label: "Twenty Run", rarity: "Uncommon", description: "Played games 20 times." },
  { code: "game_10_plays", label: "First Crowd", rarity: "Uncommon", description: "One of your games reached 10 plays." },
  { code: "game_4_rating", label: "Well Rated", rarity: "Uncommon", description: "A game averaged 4 stars or higher." },
  { code: "friend_circle", label: "Friend Circle", rarity: "Uncommon", description: "Added 3 friends." },
  { code: "public_profile", label: "Public Figure", rarity: "Uncommon", description: "Kept your profile public." },
  { code: "custom_banner", label: "Banner Builder", rarity: "Uncommon", description: "Added a banner." },
  { code: "media_post", label: "Media Drop", rarity: "Uncommon", description: "Posted an image or video." },

  // Rare
  { code: "rising_creator", label: "Rising Creator", rarity: "Rare", description: "Reached 5 followers." },
  { code: "hot_game", label: "Hot Game", rarity: "Rare", description: "A game reached 25 plays." },
  { code: "fifty_plays", label: "Fifty Run", rarity: "Rare", description: "Played games 50 times." },
  { code: "hundred_plays", label: "Hundred Club", rarity: "Rare", description: "Played games 100 times." },
  { code: "game_50_plays", label: "Game Popping", rarity: "Rare", description: "One of your games reached 50 plays." },
  { code: "ten_followers", label: "Crowd Puller", rarity: "Rare", description: "Reached 10 followers." },
  { code: "five_games", label: "Game Shelf", rarity: "Rare", description: "Uploaded 5 approved games." },
  { code: "ten_reviews", label: "Critic Mode", rarity: "Rare", description: "Posted 10 ratings/reviews." },
  { code: "week_streak", label: "Weekly Streak", rarity: "Rare", description: "Visited 7 days in a row." },
  { code: "featured_game", label: "Featured Game", rarity: "Rare", description: "Had a game featured." },
  { code: "creator_collab", label: "Creator Collab", rarity: "Rare", description: "Interacted with another creator." },
  { code: "video_post", label: "Video Poster", rarity: "Rare", description: "Posted a video update." },
  { code: "top_trending", label: "Trending Touch", rarity: "Rare", description: "Had a game reach Trending." },

  // Epic
  { code: "twenty_followers", label: "Community Pull", rarity: "Epic", description: "Reached 20 followers." },
  { code: "game_100_plays", label: "Portal Hit", rarity: "Epic", description: "One of your games reached 100 plays." },
  { code: "avg_45", label: "4.5 Star Maker", rarity: "Epic", description: "A game averaged 4.5 stars or higher." },
  { code: "ten_games", label: "Arcade Builder", rarity: "Epic", description: "Uploaded 10 approved games." },
  { code: "fifty_reviews", label: "Review Machine", rarity: "Epic", description: "Posted 50 ratings/reviews." },
  { code: "month_streak", label: "Monthly Streak", rarity: "Epic", description: "Visited 30 days in a row." },
  { code: "creator_verified", label: "Verified Creator", rarity: "Epic", description: "Earned creator verification." },
  { code: "challenge_winner", label: "Challenge Winner", rarity: "Epic", description: "Won a FlashPortal challenge." },

  // Legendary
  { code: "fifty_followers", label: "Portal Famous", rarity: "Legendary", description: "Reached 50 followers." },
  { code: "game_500_plays", label: "Certified Hit", rarity: "Legendary", description: "One of your games reached 500 plays." },
  { code: "hundred_followers", label: "Creator Star", rarity: "Legendary", description: "Reached 100 followers." },
  { code: "twenty_games", label: "Game Empire", rarity: "Legendary", description: "Uploaded 20 approved games." },
  { code: "perfect_5", label: "Perfect Five", rarity: "Legendary", description: "A game held a 5-star average." },
  { code: "launch_legend", label: "Launch Legend", rarity: "Legendary", description: "Helped shape FlashPortal before official release." },
];

export const DEFAULT_GAME_ACHIEVEMENTS = [
  { code: "play_once", label: "First Run", rarity: "Common", description: "Play this game once.", target_type: "plays", target_value: 1 },
  { code: "play_5", label: "Getting Warm", rarity: "Common", description: "Play this game 5 times.", target_type: "plays", target_value: 5 },
  { code: "play_10", label: "Locked In", rarity: "Uncommon", description: "Play this game 10 times.", target_type: "plays", target_value: 10 },
  { code: "rate_game", label: "Leave a Rating", rarity: "Common", description: "Rate this game.", target_type: "rating", target_value: 1 },
  { code: "five_star", label: "Big Fan", rarity: "Uncommon", description: "Give this game 5 stars.", target_type: "rating", target_value: 5 },
  { code: "review_game", label: "Real Feedback", rarity: "Uncommon", description: "Write a review for this game.", target_type: "review", target_value: 1 },
  { code: "save_game", label: "Keep It Close", rarity: "Common", description: "Save this game to your playlist.", target_type: "save", target_value: 1 },
  { code: "hot_start", label: "Hot Start", rarity: "Rare", description: "Help this game reach 25 total plays.", target_type: "global_plays", target_value: 25 },
  { code: "crowd_favorite", label: "Crowd Favorite", rarity: "Epic", description: "Help this game reach a 4.5 average rating.", target_type: "global_rating", target_value: 4.5 },
];

export async function awardBadge(supabase, userId, code) {
  if (!userId || !code) return;
  try {
    await supabase.from("user_badges").upsert({ user_id: userId, badge_code: code }, { onConflict: "user_id,badge_code" });
  } catch {}
}

export async function awardBadges(supabase, userId, codes = []) {
  for (const code of codes) await awardBadge(supabase, userId, code);
}

export function badgeInfo(code) {
  return BADGE_DEFINITIONS.find((badge) => badge.code === code) || { code, label: code, rarity: "Common", description: "" };
}
