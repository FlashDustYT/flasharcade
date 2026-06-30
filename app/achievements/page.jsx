"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const labels = { legacy:"🏅 Legacy", mythic:"🟣 Mythic", legendary:"🟡 Legendary", epic:"🔴 Epic", rare:"🔵 Rare", uncommon:"🟢 Uncommon", common:"⚪ Common" };

export default function AchievementsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const earnedCount = items.filter((item) => item.earned).length;

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase.rpc("fp_get_achievement_page", { target_user_id: userData.user?.id || null });
      if (!alive) return;
      if (error) console.error(error);
      setItems(data || []);
      setLoading(false);
    }
    load();
    return () => { alive = false; };
  }, []);

  const grouped = useMemo(() => items.reduce((acc, item) => {
    acc[item.rarity] ||= [];
    acc[item.rarity].push(item);
    return acc;
  }, {}), [items]);

  return (
    <main className="creator-hub-page social-home-page achievement-page-v77">
      <Link className="back-link" href="/"><ArrowLeft size={18} /> Back to FlashPortal</Link>
      <section className="creator-feed-hero">
        <span><Trophy size={16} /> Achievements</span>
        <h1>Progress tracking</h1>
        <p>Earn badges from playing, reviewing, saving, posting, uploading, and growing as a creator.</p>
      </section>
      <section className="achievement-stats-row">
        <article><strong>{earnedCount}</strong><span>Earned badges</span></article>
        <article><strong>{items.length}</strong><span>Total available</span></article>
      </section>
      {loading ? <article className="social-post-card empty"><h3>Loading achievements...</h3></article> : Object.keys(labels).map((rarity) => {
        const list = grouped[rarity] || [];
        if (!list.length) return null;
        return <section className="hub-feed-panel achievement-section" key={rarity}>
          <h2>{labels[rarity]}</h2>
          <div className="achievement-grid">
            {list.map((badge) => <article className={`achievement-card ${badge.earned ? "earned" : "locked"}`} key={badge.code}>
              <div className="badge-mark">{badge.earned ? "✓" : "○"}</div>
              <h3>{badge.title}</h3>
              <p>{badge.description}</p>
              <small>{badge.earned ? "Unlocked" : badge.unlock_hint}</small>
            </article>)}
          </div>
        </section>;
      })}
    </main>
  );
}
