import { describe, expect, test } from "vitest";
import { getSupabaseEnv, SupabaseConfigError } from "./env";

// Fake values only. Never put real keys in tests.
const validUrl = "https://example-project.supabase.co";
const validKey = "sb_publishable_test-key";

describe("getSupabaseEnv", () => {
  test("returns the URL and publishable key when both are set", () => {
    expect(getSupabaseEnv({ url: validUrl, publishableKey: validKey })).toEqual({
      url: validUrl,
      publishableKey: validKey,
    });
  });

  test("trims stray spaces copied from the dashboard", () => {
    expect(getSupabaseEnv({ url: ` ${validUrl} `, publishableKey: ` ${validKey}\n` })).toEqual({
      url: validUrl,
      publishableKey: validKey,
    });
  });

  test("names both variables when both are missing", () => {
    expect(() => getSupabaseEnv({ url: undefined, publishableKey: undefined })).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/,
    );
  });

  test("treats empty values (as in .env.example) as missing", () => {
    expect(() => getSupabaseEnv({ url: "", publishableKey: validKey })).toThrow(SupabaseConfigError);
    expect(() => getSupabaseEnv({ url: validUrl, publishableKey: "  " })).toThrow(
      /Missing: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\./,
    );
  });

  test("rejects a URL that is not http or https", () => {
    expect(() => getSupabaseEnv({ url: "example-project.supabase.co", publishableKey: validKey })).toThrow(
      /not a valid URL/,
    );
    expect(() => getSupabaseEnv({ url: "ftp://example.com", publishableKey: validKey })).toThrow(
      /not a valid URL/,
    );
  });
});
