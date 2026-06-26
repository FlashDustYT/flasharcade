import { supabase } from "./supabaseClient";

export async function getCurrentUser() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user || null;
}

export async function loadCloudSave(gameId, saveKey = "default") {
  const user = await getCurrentUser();
  if (!user || !gameId) return null;

  const { data, error } = await supabase
    .from("game_saves")
    .select("save_data, updated_at")
    .eq("user_id", user.id)
    .eq("game_id", gameId)
    .eq("save_key", saveKey)
    .maybeSingle();

  if (error) {
    console.warn("FlashPortal cloud save load failed:", error.message);
    return null;
  }

  return data || null;
}

export async function saveCloudSave(gameId, saveData, saveKey = "default") {
  const user = await getCurrentUser();
  if (!user || !gameId) return { ok: false, reason: "not_signed_in" };

  const { error } = await supabase
    .from("game_saves")
    .upsert(
      {
        user_id: user.id,
        game_id: gameId,
        save_key: saveKey,
        save_data: saveData || {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,game_id,save_key" }
    );

  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function deleteCloudSave(gameId, saveKey = "default") {
  const user = await getCurrentUser();
  if (!user || !gameId) return { ok: false, reason: "not_signed_in" };

  const { error } = await supabase
    .from("game_saves")
    .delete()
    .eq("user_id", user.id)
    .eq("game_id", gameId)
    .eq("save_key", saveKey);

  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
