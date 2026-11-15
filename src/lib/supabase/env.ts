// Reads and checks the two public Supabase settings.
//
// Only the publishable key (sb_publishable_..., the replacement for the old
// "anon" key) belongs here. The secret / service-role key bypasses
// Row Level Security and must never be used in this app's frontend code.

export type SupabaseEnv = {
  url: string;
  publishableKey: string;
};

type RawSupabaseEnv = {
  url: string | undefined;
  publishableKey: string | undefined;
};

export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

// Next.js only copies NEXT_PUBLIC_ variables into browser code when they are
// written out in full like this, so do not read them with a dynamic key.
function readProcessEnv(): RawSupabaseEnv {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

export function getSupabaseEnv(raw: RawSupabaseEnv = readProcessEnv()): SupabaseEnv {
  const url = raw.url?.trim() ?? "";
  const publishableKey = raw.publishableKey?.trim() ?? "";

  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!publishableKey) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  if (missing.length > 0) {
    throw new SupabaseConfigError(
      `Supabase is not configured. Missing: ${missing.join(", ")}. ` +
        "Copy .env.example to .env.local and fill in the values " +
        "(see docs/supabase-setup.md).",
    );
  }

  if (!URL.canParse(url) || !/^https?:$/.test(new URL(url).protocol)) {
    throw new SupabaseConfigError(
      "NEXT_PUBLIC_SUPABASE_URL is not a valid URL. " +
        "It should look like https://your-project-ref.supabase.co",
    );
  }

  return { url, publishableKey };
}
