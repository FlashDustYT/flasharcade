function normalizePost(row, reactionMap = {}, profileMap = {}) {
  const profile = row.user_profiles || profileMap[row.user_id] || {};
  return {
    ...row,
    likes: Number(row.likes || 0),
    dislikes: Number(row.dislikes || 0),
    comments: Number(row.comments || 0),
    my_reaction: row.my_reaction || reactionMap[row.id] || null,
    author_username: row.author_username || profile.username || "player",
    author_display_name: row.author_display_name || profile.display_name || "FlashPortal Player",
    author_avatar_url: row.author_avatar_url || profile.avatar_url || "",
    author_is_private: Boolean(row.author_is_private ?? profile.is_private),
    author_last_seen_at: row.author_last_seen_at || profile.last_seen_at || null,
  };
}

export async function getCreatorFeed(supabase, limit = 25) {
  const { data: userData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const currentUserId = userData?.user?.id || null;

  const rpc = await supabase.rpc("fp_get_creator_feed", { feed_limit: limit });
  if (!rpc.error && Array.isArray(rpc.data)) {
    return rpc.data.map((row) => normalizePost(row));
  }

  // Fallback keeps the page usable if the newest SQL was not applied yet.
  const { data: posts, error } = await supabase
    .from("social_posts")
    .select("*, user_profiles(display_name, username, avatar_url, is_private, last_seen_at)")
    .eq("is_deleted", false)
    .eq("is_private", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw rpc.error || error;

  const postIds = (posts || []).map((post) => post.id);
  const reactionMap = {};

  if (currentUserId && postIds.length) {
    const { data: reactions } = await supabase
      .from("social_post_reactions")
      .select("post_id, reaction")
      .eq("user_id", currentUserId)
      .in("post_id", postIds);
    (reactions || []).forEach((row) => { reactionMap[row.post_id] = row.reaction; });
  }

  return (posts || []).map((row) => normalizePost(row, reactionMap));
}

export async function setSocialReaction(supabase, postId, reaction) {
  const { data, error } = await supabase.rpc("fp_set_social_reaction", {
    target_post_id: postId,
    new_reaction: reaction,
  });
  if (!error) return Array.isArray(data) ? data[0] : data;

  // Fallback if RPC is missing: do direct table operations.
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw error;

  const { data: existing } = await supabase
    .from("social_post_reactions")
    .select("id, reaction")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  let finalReaction = reaction;
  if (existing?.reaction === reaction) {
    await supabase.from("social_post_reactions").delete().eq("id", existing.id);
    finalReaction = null;
  } else if (existing?.id) {
    await supabase.from("social_post_reactions").update({ reaction, updated_at: new Date().toISOString() }).eq("id", existing.id);
  } else {
    await supabase.from("social_post_reactions").insert({ post_id: postId, user_id: userId, reaction });
  }

  const { count: likeCount } = await supabase.from("social_post_reactions").select("id", { count: "exact", head: true }).eq("post_id", postId).eq("reaction", "like");
  const { count: dislikeCount } = await supabase.from("social_post_reactions").select("id", { count: "exact", head: true }).eq("post_id", postId).eq("reaction", "dislike");
  await supabase.from("social_posts").update({ likes: likeCount || 0, dislikes: dislikeCount || 0 }).eq("id", postId);
  return { likes: likeCount || 0, dislikes: dislikeCount || 0, my_reaction: finalReaction };
}

export async function deleteSocialComment(supabase, commentId) {
  const { data, error } = await supabase.rpc("fp_delete_social_comment", {
    target_comment_id: commentId,
  });
  if (!error) return data;

  // Direct fallback lets comment owner/post owner delete after RLS SQL is installed.
  const { error: updateError } = await supabase.from("social_comments").update({ is_deleted: true }).eq("id", commentId);
  if (updateError) throw error || updateError;
  return true;
}
