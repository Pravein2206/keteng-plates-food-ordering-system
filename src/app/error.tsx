"use client"; // Next.js error pages must run in the browser.

// Shown instead of a blank page when the menu (or anything on the page) fails to load.
// retry() asks Next.js to fetch the data again and re-render the page.
export default function MenuError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e87932]">Keteng Plates</p>
      </header>

      <div
        role="alert"
        className="rounded-3xl border border-[#efc8b7] bg-[#fff0e5] px-5 py-8 text-center shadow-[0_14px_40px_rgba(139,63,34,0.08)]"
      >
        <p className="font-semibold text-[#8b3f22]">We couldn&apos;t load the menu.</p>
        <p className="mt-1 text-sm text-[#a94816]">
          Please check your internet connection and try again.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-4 min-h-11 rounded-full bg-[#1d5b45] px-6 font-semibold text-white hover:bg-[#143f31]"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
