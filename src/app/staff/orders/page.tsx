import { redirect } from "next/navigation";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";
import { formatRinggit } from "@/lib/money";
import { getStaffOrders } from "@/lib/staff-orders";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

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
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#e6dfd3] pb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e87932]">Operations</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#143f31]">Staff order queue</h1>
          <p className="mt-2 text-sm text-[#627269]">
            Customer order details are visible only to authorized staff.
          </p>
        </div>
        <StaffLogoutButton />
      </header>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#d8d0c3] bg-white px-4 py-10 text-center text-[#627269]">
          No orders have been submitted yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {(orders as StaffOrder[]).map((order) => (
            <li
              key={order.id}
              className="rounded-3xl border border-[#e6dfd3] bg-white p-5 shadow-[0_10px_30px_rgba(20,63,49,0.07)] sm:p-6"
            >
              <article aria-labelledby={`order-${order.id}`}>
                <header className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 id={`order-${order.id}`} className="text-lg font-semibold">
                      {order.reference}
                    </h2>
                    <p className="text-sm text-[#819087]">
                      {new Date(order.created_at).toLocaleString("en-MY", {
                        timeZone: "Asia/Kuala_Lumpur",
                      })}
                    </p>
                  </div>
                  <p className="font-bold tabular-nums text-[#1d5b45]">{formatRinggit(order.total_sen)}</p>
                </header>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-xl bg-[#f3efe7] p-3">
                    <dt className="text-xs font-bold uppercase tracking-wider text-[#819087]">Customer</dt>
                    <dd>{order.customer_full_name}</dd>
                  </div>
                  <div className="rounded-xl bg-[#f3efe7] p-3">
                    <dt className="text-xs font-bold uppercase tracking-wider text-[#819087]">Phone</dt>
                    <dd>{order.phone_number}</dd>
                  </div>
                  <div className="rounded-xl bg-[#f3efe7] p-3">
                    <dt className="text-xs font-bold uppercase tracking-wider text-[#819087]">Delivery batch</dt>
                    <dd>{order.delivery_batch_label}</dd>
                  </div>
                  <div className="rounded-xl bg-[#f3efe7] p-3">
                    <dt className="text-xs font-bold uppercase tracking-wider text-[#819087]">Delivery address</dt>
                    <dd className="break-words">{order.delivery_address}</dd>
                  </div>
                </dl>
                <ul className="mt-4 border-t border-[#e6dfd3] pt-3 text-sm">
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
