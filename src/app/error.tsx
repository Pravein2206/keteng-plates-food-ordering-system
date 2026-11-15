"use client"; // Next.js error pages must run in the browser.

// Shown instead of a blank page when the menu (or anything on the page) fails to load.
// retry() asks Next.js to fetch the data again and re-render the page.
export default function MenuError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Keteng Plates</h1>
      </header>

      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center dark:border-red-900 dark:bg-red-950"
      >
        <p className="font-semibold text-red-900 dark:text-red-100">We couldn&apos;t load the menu.</p>
        <p className="mt-1 text-sm text-red-800 dark:text-red-200">
          Please check your internet connection and try again.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-4 min-h-11 rounded-full bg-zinc-900 px-6 font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
