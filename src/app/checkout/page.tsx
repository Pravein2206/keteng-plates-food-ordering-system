import Link from "next/link";

// Placeholder until US03 (delivery batch, name, phone and address).
export default function CheckoutPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <header className="mb-6">
        <Link href="/cart" className="text-sm font-medium underline underline-offset-4">
          ← Back to cart
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Checkout</h1>
      </header>
      <p className="text-zinc-600 dark:text-zinc-400">Delivery details are coming soon.</p>
    </main>
  );
}
