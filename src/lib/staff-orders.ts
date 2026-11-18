import type { SupabaseClient, User } from "@supabase/supabase-js";

export function isStaffUser(user: User | null): user is User {
  return user?.app_metadata?.role === "staff";
}

export async function getStaffOrders(client: SupabaseClient) {
  const { data, error } = await client.auth.getUser();
  if (error || !isStaffUser(data.user)) return null;

  const { data: orders, error: ordersError } = await client
    .from("orders")
    .select(
      "id, reference, customer_full_name, phone_number, delivery_address, delivery_batch_id, delivery_batch_label, total_sen, created_at, order_items (item_code, item_name, unit_price_sen, quantity, line_total_sen)",
    )
    .order("created_at", { ascending: false });

  if (ordersError) throw new Error("Could not load the staff order queue.");
  return orders ?? [];
}
