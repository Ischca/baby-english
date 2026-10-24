import { createClient } from "npm:@supabase/supabase-js@2.49.4";
// Environment reads stay inside the Deno runtime; the handler is independently testable.
export function services() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const admin = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !anon || !admin) throw new Error("Server configuration missing");
  const auth = createClient(url, anon, { auth: { persistSession: false } });
  const db = createClient(url, admin, { auth: { persistSession: false } });
  return {
    async authenticate(token: string) {
      const { data, error } = await auth.auth.getUser(token);
      return error ? null : (data.user?.id ?? null);
    },
    async rateLimit(id: string) {
      const { data, error } = await db.rpc("consume_ai_budget", {
        learner_id: id,
      });
      if (error) throw new Error("Rate limiter unavailable");
      return data === true;
    },
  };
}
