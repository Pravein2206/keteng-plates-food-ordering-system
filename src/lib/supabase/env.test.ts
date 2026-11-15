import { describe, expect, test } from "vitest";
import { getSupabaseEnv, SupabaseConfigError } from "./env";

// Fake values only. Never put real keys in tests.
const validUrl = "https://example-project.supabase.co";
const validKey = "test-anon-key";

describe("getSupabaseEnv", () => {
  test("returns the URL and anon key when both are set", () => {
    expect(getSupabaseEnv({ url: validUrl, anonKey: validKey })).toEqual({
      url: validUrl,
      anonKey: validKey,
    });
  });

  test("trims stray spaces copied from the dashboard", () => {
    expect(getSupabaseEnv({ url: ` ${validUrl} `, anonKey: ` ${validKey}\n` })).toEqual({
      url: validUrl,
      anonKey: validKey,
    });
  });

  test("names both variables when both are missing", () => {
    expect(() => getSupabaseEnv({ url: undefined, anonKey: undefined })).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY/,
    );
  });

  test("treats empty values (as in .env.example) as missing", () => {
    expect(() => getSupabaseEnv({ url: "", anonKey: validKey })).toThrow(SupabaseConfigError);
    expect(() => getSupabaseEnv({ url: validUrl, anonKey: "  " })).toThrow(
      /Missing: NEXT_PUBLIC_SUPABASE_ANON_KEY\./,
    );
  });

  test("rejects a URL that is not http or https", () => {
    expect(() => getSupabaseEnv({ url: "example-project.supabase.co", anonKey: validKey })).toThrow(
      /not a valid URL/,
    );
    expect(() => getSupabaseEnv({ url: "ftp://example.com", anonKey: validKey })).toThrow(
      /not a valid URL/,
    );
  });
});
