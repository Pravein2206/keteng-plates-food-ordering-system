// Supabase client for code that runs on the server (Server Components,
// Server Actions and Route Handlers). Create a new client for every request;
// never share one between requests, or one user's session could leak to another.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

export async function createClient() {
  const { url, publishableKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot set cookies. This is safe to ignore
          // until staff login exists; that work will refresh sessions in a
          // Next.js proxy instead.
        }
      },
    },
  });
}
