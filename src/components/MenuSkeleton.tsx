// Grey placeholder rows shown while the menu loads.
export function MenuSkeleton() {
  return (
    <div role="status" aria-live="polite" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <span className="sr-only">Loading menu…</span>
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="h-72 animate-pulse rounded-[1.5rem] bg-[#eee8de]"
        />
      ))}
    </div>
  );
}
