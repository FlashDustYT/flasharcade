export function cleanUsername(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_.]/g, "")
    .slice(0, 24);
}

export function profileFromUser(user) {
  const emailName = user?.email?.split("@")[0] || "player";
  return {
    id: user?.id,
    email: user?.email || "",
    display_name: user?.user_metadata?.full_name || emailName,
    username: cleanUsername(emailName),
    bio: "Playing games on FlashPortal.",
    avatar_url: user?.user_metadata?.avatar_url || "",
    banner_url: "",
    is_private: false,
    followers: 0,
    following: 0,
  };
}

export async function ensureUserProfile(supabase, user) {
  if (!user) return null;

  const fallback = profileFromUser(user);
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (data && !error) return data;

  const { data: created, error: createError } = await supabase
    .from("user_profiles")
    .upsert(fallback, { onConflict: "id" })
    .select("*")
    .single();

  if (createError) throw createError;
  return created || fallback;
}
