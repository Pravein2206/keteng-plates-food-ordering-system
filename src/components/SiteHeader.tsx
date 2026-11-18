"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { UiIcon } from "./UiIcon";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { lines } = useCart();
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  const linkClass = (href: string) =>
    `rounded-full px-3 py-2 text-sm font-bold transition-colors ${
      pathname === href
        ?           "bg-surface-muted text-brand-green-dark"
        : "text-[#496257] hover:bg-[#f3efe7] hover:text-[#143f31]"
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-border/90 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0" aria-label="Keteng Plates home">
          <span className="text-base font-black tracking-[0.08em] text-brand-green">
          Keteng <span className="text-brand-orange">Plates</span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
          <Link href="/" className={linkClass("/")}>Home</Link>
          <Link href="/#menu" className={linkClass("/#menu")}>Menu</Link>
          <Link href="/cart" className={linkClass("/cart")}>
            Cart
            {itemCount > 0 ? (
              <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[#e87932] px-1.5 py-0.5 text-xs text-white" aria-label={`${itemCount} items in cart`}>
                {itemCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/#menu"
            className="ml-2 inline-flex min-h-11 items-center rounded-xl bg-brand-green px-5 text-sm font-bold text-white shadow-card hover:bg-brand-green-dark"
          >
            Order now
          </Link>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <Link
            href="/cart"
            aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
            className="relative inline-flex size-11 items-center justify-center rounded-full text-lg text-brand-green hover:bg-surface-muted"
          >
            <UiIcon name="cart" size={21} />
            {itemCount > 0 ? (
              <span className="absolute right-0 top-0 flex size-5 items-center justify-center rounded-full bg-[#e87932] text-[0.65rem] font-black text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className="inline-flex size-11 items-center justify-center rounded-full text-2xl text-brand-green-dark hover:bg-surface-muted"
          >
            <UiIcon name={open ? "close" : "menu"} size={22} />
          </button>
        </div>
      </div>

      {open ? (
        <nav aria-label="Mobile navigation" className="border-t border-border bg-background px-4 py-3 md:hidden">
          <div className="grid grid-cols-3 gap-2">
            <Link href="/" onClick={() => setOpen(false)} className="min-h-11 rounded-xl px-3 py-3 text-center text-sm font-bold text-text-muted hover:bg-surface-muted">Home</Link>
            <Link href="/#menu" onClick={() => setOpen(false)} className="min-h-11 rounded-xl px-3 py-3 text-center text-sm font-bold text-text-muted hover:bg-surface-muted">Menu</Link>
            <Link href="/#menu" onClick={() => setOpen(false)} className="min-h-11 rounded-xl bg-brand-green px-3 py-3 text-center text-sm font-bold text-white">Order now</Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
