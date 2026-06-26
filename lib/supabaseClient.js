import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://apnxmejkizttyyfagbjt.supabase.co";
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_iOCOM6wDQoQ6royCPjX84g_ZC5oM-l-";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
