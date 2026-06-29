import { SupabaseClient } from "@supabase/supabase-js";

export type SocialReaction = "like" | "dislike" | null;

export async function setSocialReaction(
  supabase: SupabaseClient,
  postId: number,
  reaction: SocialReaction
) {
  const { data, error } = await supabase.rpc("fp_set_social_reaction", {
    target_post_id: postId,
    new_reaction: reaction,
  });

  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function addSocialComment(
  supabase: SupabaseClient,
  postId: number,
  body: string
) {
  const { data, error } = await supabase.rpc("fp_add_social_comment", {
    target_post_id: postId,
    comment_body: body,
  });

  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function deleteSocialComment(
  supabase: SupabaseClient,
  commentId: number
) {
  const { data, error } = await supabase.rpc("fp_delete_social_comment", {
    target_comment_id: commentId,
  });

  if (error) throw error;
  return Number(data ?? 0);
}
