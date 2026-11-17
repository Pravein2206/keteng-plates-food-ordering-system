import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const client = await createClient();
  const { error } = await client.auth.signOut();
  if (error) {
    return Response.json({ error: "Could not sign out. Please try again." }, { status: 503 });
  }
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
