"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, UserRound } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

export default function ConversationPage({ params }) {
  const conversationId = params.conversationId;
  const bottomRef = useRef(null);
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("Loading conversation...");

  async function loadConversation() {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user || null;
    setUser(currentUser);

    if (!currentUser) {
      setStatus("Log in to view this conversation.");
      return;
    }

    try {
      await supabase.rpc("touch_last_seen");
    } catch {}

    const { data: memberData, error: memberError } = await supabase
      .from("conversation_members")
      .select("*")
      .eq("conversation_id", conversationId);

    if (memberError) {
      setStatus(`Messages need V69 SQL: ${memberError.message}`);
      return;
    }

    setMembers(memberData || []);

    const ids = (memberData || []).map((item) => item.user_id);
    if (ids.length) {
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .in("id", ids);
      setProfiles(profileData || []);
    }

    const { data: messageData, error: messageError } = await supabase
      .from("direct_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messageError) {
      setStatus(`Could not load messages: ${messageError.message}`);
      return;
    }

    setMessages(messageData || []);
    setStatus("");
  }

  useEffect(() => {
    loadConversation();

    const channel = supabase
      .channel(`direct_messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((current) => {
            if (current.some((item) => item.id === payload.new.id)) return current;
            return [...current, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage(event) {
    event.preventDefault();
    if (!user || !draft.trim()) return;

    const body = draft.trim();
    setDraft("");

    const { error } = await supabase.from("direct_messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body,
    });

    if (error) {
      setStatus(`Send failed: ${error.message}. Run V69 SQL.`);
      setDraft(body);
      return;
    }

    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
  }

  function profileFor(id) {
    return profiles.find((profile) => profile.id === id);
  }

  return (
    <main className="messages-page">
      <Link className="back-link" href="/messages"><ArrowLeft size={18} /> Back to Inbox</Link>

      <section className="chat-shell">
        <header className="chat-header">
          <h1>Conversation</h1>
          <p>{members.length} member{members.length === 1 ? "" : "s"}</p>
          {status && <span>{status}</span>}
        </header>

        <section className="chat-stream">
          {messages.map((message) => {
            const mine = message.sender_id === user?.id;
            const sender = profileFor(message.sender_id);
            return (
              <article className={`chat-bubble-row ${mine ? "mine" : ""}`} key={message.id}>
                {!mine && (
                  <div className="mini-avatar">
                    {sender?.avatar_url ? <img src={sender.avatar_url} alt="" /> : <UserRound size={18} />}
                  </div>
                )}
                <div className="chat-bubble">
                  <p>{message.body}</p>
                  <span>{new Date(message.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                </div>
              </article>
            );
          })}
          <div ref={bottomRef} />
        </section>

        <form className="chat-compose" onSubmit={sendMessage}>
          <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type a message..." />
          <button type="submit"><Send size={16} /> Send</button>
        </form>
      </section>
    </main>
  );
}
