"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Lock, Trophy } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { BADGE_DEFINITIONS, awardEarlyBuildBadges, normalizeBadgeRow, rarityRank, RARITY_ORDER } from "../../lib/badges";

const labels = {
  Legacy: "🏅 Legacy",
  Mythic: "🟣 Mythic",
  Legendary: "🟡 Legendary",
  Epic: "🔴 Epic",
  Rare: "🔵 Rare",
  Uncommon: "🟢 Uncommon",
  Common: "⚪ Common",
};

export default function AchievementsPage() {
  const [items, setItems] = useState(BADGE_DEFINITIONS.map((badge) => normalizeBadgeRow({ ...badge, earned: false })));
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const earnedCount = items.filter((item) => item.earned).length;

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setStatus("");
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || null;

      if (userId) await awardEarlyBuildBadges(supabase, userId);

      let loaded = [];
      const rpc = await supabase.rpc("fp_get_achievement_page", { target_user_id: userId });
      if (!rpc.error && Array.isArray(rpc.data) && rpc.data.length) {
        loaded = rpc.data.map((row) => normalizeBadgeRow(row));
      } else {
        const { data: catalog } = await supabase.from("achievement_catalog").select("*").order("points", { ascending: false });
        const { data: earned } = userId
          ? await supabase.from("user_badges").select("badge_code, earned_at").eq("user_id", userId)
          : { data: [] };
        const earnedMap = new Map((earned || []).map((row) => [row.badge_code, row.earned_at]));
        const source = Array.isArray(catalog) && catalog.length ? catalog : BADGE_DEFINITIONS;
        loaded = source.map((row) => normalizeBadgeRow({ ...row, earned: earnedMap.has(row.code), earned_at: earnedMap.get(row.code) || null }));
      }

      // Always show the local guide, even if the DB catalog is behind.
      const byCode = new Map(loaded.map((row) => [row.code || row.badge_code, row]));
      BADGE_DEFINITIONS.forEach((badge) => {
        if (!byCode.has(badge.code)) byCode.set(badge.code, normalizeBadgeRow({ ...badge, earned: false }));
      });

      const finalItems = [...byCode.values()].sort((a, b) => rarityRank(a.rarity) - rarityRank(b.rarity) || Number(b.points || 0) - Number(a.points || 0) || String(a.title).localeCompare(String(b.title)));
      if (!alive) return;
      setItems(finalItems);
      if (rpc.error) setStatus("Showing the local badge guide. Run V80 SQL so earned badges sync from Supabase.");
      setLoading(false);
    }

    load();
    return () => { alive = false; };
  }, []);

  const grouped = useMemo(() => items.reduce((acc, item) => {
    const rarity = item.rarity || "Common";
    acc[rarity] ||= [];
    acc[rarity].push(item);
    return acc;
  }, {}), [items]);

  return (
    <main className="creator-hub-page social-home-page achievement-page-v77">
      <Link className="back-link" href="/"><ArrowLeft size={18} /> Back to FlashPortal</Link>
      <section className="creator-feed-hero">
        <span><Trophy size={16} /> Achievements</span>
        <h1>Progress tracking</h1>
        <p>Earn badges from playing, reviewing, saving, posting, messaging, uploading, and growing as a creator.</p>
        {status && <p className="hub-status">{status}</p>}
      </section>
      <section className="achievement-stats-row">
        <article><strong>{earnedCount}</strong><span>Earned badges</span></article>
        <article><strong>{items.length}</strong><span>Total available</span></article>
      </section>
      {RARITY_ORDER.map((rarity) => {
        const list = grouped[rarity] || [];
        if (!list.length) return null;
        return <section className="hub-feed-panel achievement-section" key={rarity}>
          <h2>{labels[rarity] || rarity}</h2>
          <div className="achievement-grid">
            {list.map((badge) => <article className={`achievement-card ${badge.earned ? "earned" : "locked"}`} key={badge.code || badge.badge_code}>
              <div className="badge-mark">{badge.earned ? <CheckCircle2 size={20} /> : <Lock size={18} />}</div>
              <h3>{badge.title || badge.label}</h3>
              <p>{badge.description}</p>
              <small>{badge.earned ? "Unlocked" : badge.unlock_hint}</small>
            </article>)}
          </div>
        </section>;
      })}
      {loading && <p className="editor-help">Refreshing badge data...</p>}
    </main>
  );
}
