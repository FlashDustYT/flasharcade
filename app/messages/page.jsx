"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Inbox, MessageCircle, Search, Send, UserRound } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { getLastSeenLabel, isRecentlyOnline } from "../../lib/presence";

export default function MessagesInboxPage() {
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [latestMessages, setLatestMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Loading messages...");

  async function loadInbox() {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user || null;
    setUser(currentUser);

    if (!currentUser) {
      setStatus("Log in to use messages.");
      return;
    }

    try {
      await supabase.rpc("touch_last_seen");
    } catch {}

    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("*")
      .neq("id", currentUser.id)
      .order("followers", { ascending: false })
      .limit(100);

    setProfiles(profileData || []);

    const { data: memberData, error: memberError } = await supabase
      .from("conversation_members")
      .select("conversation_id, user_id")
      .eq("user_id", currentUser.id);

    if (memberError) {
      setStatus(`Messages need V69 SQL: ${memberError.message}`);
      return;
    }

    const conversationIds = (memberData || []).map((item) => item.conversation_id);
    setMemberships(memberData || []);

    if (conversationIds.length) {
      const { data: messageData } = await supabase
        .from("direct_messages")
        .select("*")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false })
        .limit(80);

      setLatestMessages(messageData || []);
    }

    setStatus("");
  }

  useEffect(() => {
    loadInbox();
  }, []);

  async function login() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/messages` },
    });
  }

  async function startConversation(otherUserId) {
    if (!user) return login();

    const { data, error } = await supabase.rpc("get_or_create_direct_conversation", {
      other_user_id: otherUserId,
    });

    if (error) {
      setStatus(`Could not start message: ${error.message}. Run V69 SQL.`);
      return;
    }

    window.location.href = `/messages/${data}`;
  }

  const filteredProfiles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return profiles;
    return profiles.filter((profile) =>
      [profile.display_name, profile.username, profile.email, profile.bio]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [profiles, query]);

  const latestByConversation = useMemo(() => {
    const map = new Map();
    latestMessages.forEach((message) => {
      if (!map.has(message.conversation_id)) map.set(message.conversation_id, message);
    });
    return map;
  }, [latestMessages]);

  if (!user) {
    return (
      <main className="messages-page">
        <Link className="back-link" href="/"><ArrowLeft size={18} /> Back to FlashPortal</Link>
        <section className="messages-hero">
          <Inbox size={40} />
          <h1>Messages</h1>
          <p>Log in to message creators and friends.</p>
          <button type="button" onClick={login}>Login with Google</button>
        </section>
      </main>
    );
  }

  return (
    <main className="messages-page">
      <Link className="back-link" href="/"><ArrowLeft size={18} /> Back to FlashPortal</Link>

      <section className="messages-hero">
        <span><Inbox size={16} /> FlashPortal Messages</span>
        <h1>Inbox</h1>
        <p>Start a direct message with creators and players. Conversations update live on the chat page.</p>
        {status && <p className="hub-status">{status}</p>}
      </section>

      <section className="messages-layout">
        <section className="messages-panel">
          <h2>Find People</h2>
          <label className="hub-search">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users..." />
          </label>

          <div className="message-profile-list">
            {filteredProfiles.map((profile) => {
              const online = isRecentlyOnline(profile.last_seen_at);
              return (
                <article className="message-person-card" key={profile.id}>
                  <div className="mini-avatar">
                    {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : <UserRound size={22} />}
                    <span className={`online-dot ${online ? "online" : ""}`} />
                  </div>
                  <div>
                    <strong>{profile.display_name || "FlashPortal User"}</strong>
                    <span>@{profile.username || profile.email?.split("@")[0] || "user"} • {getLastSeenLabel(profile.last_seen_at)}</span>
                  </div>
                  <button type="button" onClick={() => startConversation(profile.id)}>
                    <Send size={15} /> Message
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="messages-panel">
          <h2>Recent Conversations</h2>
          {memberships.length ? memberships.map((membership) => {
            const latest = latestByConversation.get(membership.conversation_id);
            return (
              <Link className="conversation-row" href={`/messages/${membership.conversation_id}`} key={membership.conversation_id}>
                <MessageCircle size={18} />
                <div>
                  <strong>Conversation</strong>
                  <span>{latest?.body || "Open chat"}</span>
                </div>
              </Link>
            );
          }) : (
            <article className="empty-panel">
              <MessageCircle size={34} />
              <h3>No conversations yet</h3>
              <p>Search for a creator or friend and click Message.</p>
            </article>
          )}
        </section>
      </section>
    </main>
  );
}
