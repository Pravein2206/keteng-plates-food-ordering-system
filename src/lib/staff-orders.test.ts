import { describe, expect, test, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getStaffOrders } from "@/lib/staff-orders";

describe("getStaffOrders", () => {
  test("does not query private orders for an unauthenticated or non-staff user", async () => {
    const getUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: "test-user",
          app_metadata: {},
          user_metadata: { role: "staff" },
        },
      },
      error: null,
    });
    const from = vi.fn();
    const client = {
      auth: { getUser },
      from,
    } as unknown as SupabaseClient;

    await expect(getStaffOrders(client)).resolves.toBeNull();
    expect(getUser).toHaveBeenCalledOnce();
    expect(from).not.toHaveBeenCalled();
  });

  test("does not query orders when the authenticated staff check fails", async () => {
    const client = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error("No active session"),
        }),
      },
      from: vi.fn(),
    } as unknown as SupabaseClient;

    await expect(getStaffOrders(client)).resolves.toBeNull();
    expect(client.from).not.toHaveBeenCalled();
  });
});
