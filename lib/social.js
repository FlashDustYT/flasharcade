export async function getCreatorFeed(supabase, limit = 25) {
  const { data, error } = await supabase.rpc("fp_get_creator_feed", { feed_limit: limit });
  if (error) throw error;
  return data || [];
}

export async function setSocialReaction(supabase, postId, reaction) {
  const { data, error } = await supabase.rpc("fp_set_social_reaction", {
    target_post_id: postId,
    new_reaction: reaction,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function deleteSocialComment(supabase, commentId) {
  const { data, error } = await supabase.rpc("fp_delete_social_comment", {
    target_comment_id: commentId,
  });
  if (error) throw error;
  return data;
}
