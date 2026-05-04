import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://divvzcjugsiyucpemaxi.supabase.co";
const supabaseAnonKey = "sb_publishable_V_pwDKJpFaPGs0tNYi-Jhg_sjwdiFt_";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
