import { redirect } from "next/navigation";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";
import { formatRinggit } from "@/lib/money";
import { getStaffOrders } from "@/lib/staff-orders";
import { createClient } from "@/lib/supabase/server";

type OrderItem = {
  item_code: string;
  item_name: string;
  unit_price_sen: number;
  quantity: number;
  line_total_sen: number;
};

type StaffOrder = {
  id: number;
  reference: string;
  customer_full_name: string;
  phone_number: string;
  delivery_address: string;
  delivery_batch_label: string;
  total_sen: number;
  created_at: string;
  order_items: OrderItem[];
};

export default async function StaffOrdersPage() {
  const client = await createClient();
  const orders = await getStaffOrders(client);
  if (orders === null) redirect("/staff/login");

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Staff order queue</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Customer order details are visible only to authorized staff.
          </p>
        </div>
        <StaffLogoutButton />
      </header>

      {orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center dark:border-zinc-700">
          No orders have been submitted yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {(orders as StaffOrder[]).map((order) => (
            <li
              key={order.id}
              className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <article aria-labelledby={`order-${order.id}`}>
                <header className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 id={`order-${order.id}`} className="text-lg font-semibold">
                      {order.reference}
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(order.created_at).toLocaleString("en-MY", {
                        timeZone: "Asia/Kuala_Lumpur",
                      })}
                    </p>
                  </div>
                  <p className="font-semibold tabular-nums">{formatRinggit(order.total_sen)}</p>
                </header>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-medium">Customer</dt>
                    <dd>{order.customer_full_name}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Phone</dt>
                    <dd>{order.phone_number}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Delivery batch</dt>
                    <dd>{order.delivery_batch_label}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Delivery address</dt>
                    <dd className="break-words">{order.delivery_address}</dd>
                  </div>
                </dl>
                <ul className="mt-4 border-t border-zinc-200 pt-3 text-sm dark:border-zinc-800">
                  {order.order_items.map((item) => (
                    <li
                      key={item.item_code}
                      className="flex justify-between gap-3 py-1"
                    >
                      <span>
                        {item.item_name} × {item.quantity}
                      </span>
                      <span className="shrink-0 tabular-nums">
                        {formatRinggit(item.line_total_sen)}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
