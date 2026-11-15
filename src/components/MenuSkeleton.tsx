// Grey placeholder rows shown while the menu loads.
export function MenuSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-2">
      <span className="sr-only">Loading menu…</span>
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="h-16 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"
        />
      ))}
    </div>
  );
}
