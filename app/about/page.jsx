import Link from "next/link";
import { ArrowLeft, Flame, Heart, Sparkles, Trophy, Users, Zap } from "lucide-react";

export default function AboutPage() {
  const items = [
    ["Creator Profiles", "Avatar, banner, bio, uploaded games, followers, total plays, and average rating.", Sparkles],
    ["Weekly Trending", "Trending Today, This Week, and This Month so the homepage rotates more fairly.", Flame],
    ["Daily Challenge", "A featured daily game/task with XP, streaks, and limited badges.", Zap],
    ["Levels and Badges", "Earn profile XP for playing, reviewing, uploading, saving games, and helping creators.", Trophy],
    ["Wishlist + Playlist", "Playlist for saved games, wishlist for upcoming games and launch notifications.", Heart],
    ["Follow Creators", "Get notifications when a creator uploads, updates, or launches a new game.", Users],
  ];

  return (
    <main className="social-home-page">
      <Link className="back-link" href="/"><ArrowLeft size={18} /> Back to FlashPortal</Link>
      <section className="creator-feed-hero">
        <span>About FlashPortal</span>
        <h1>Community Roadmap</h1>
        <p>The next layer is making FlashPortal feel alive: profiles, challenges, creator follows, badges, and better discovery.</p>
      </section>
      <section className="roadmap-grid">
        {items.map(([title, body, Icon]) => (
          <article className="social-post-card" key={title}>
            <Icon size={30} />
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
