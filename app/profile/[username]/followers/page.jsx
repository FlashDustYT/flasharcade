"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";
import { supabase } from "../../../../lib/supabaseClient";

export default function FollowersPage({ params }) {
  const lookup = params.username;
  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function load() {
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .or(`username.eq.${lookup},id.eq.${lookup}`)
        .maybeSingle();

      if (!profileData) {
        setStatus("Profile not found.");
        return;
      }

      setProfile(profileData);

      const { data: rows, error } = await supabase
        .from("profile_follows")
        .select("follower_id")
        .eq("following_id", profileData.id)
        .order("created_at", { ascending: false });

      if (error) {
        setStatus(`Could not load followers: ${error.message}. Run V61 SQL.`);
        return;
      }

      const ids = (rows || []).map((row) => row.follower_id);
      if (!ids.length) return;

      const { data: people } = await supabase
        .from("user_profiles")
        .select("*")
        .in("id", ids);

      setFollowers(people || []);
    }

    load();
  }, [lookup]);

  return (
    <main className="social-home-page">
      <Link className="back-link" href={profile ? `/profile/${profile.username || profile.id}` : "/creator-hub"}>
        <ArrowLeft size={18} /> Back
      </Link>

      <section className="hub-feed-panel followers-page-panel">
        <h1>{profile?.display_name || "Profile"} Followers</h1>
        {status && <p className="hub-status">{status}</p>}
        {!status && !followers.length && <p>No followers yet.</p>}

        {followers.map((person) => (
          <article className="creator-mini-card" key={person.id}>
            <div className="mini-avatar">
              {person.avatar_url ? <img src={person.avatar_url} alt="" /> : <UserRound size={22} />}
            </div>
            <div>
              <strong>{person.display_name || "FlashPortal User"}</strong>
              <span>@{person.username || "user"}</span>
              <Link href={`/profile/${person.username || person.id}`}>View Profile</Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
