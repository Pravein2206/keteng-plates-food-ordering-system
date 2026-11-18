import type { CategoryKind } from "@/types/menu";

type FoodPlaceholderProps = {
  categoryKind: CategoryKind;
  compact?: boolean;
};

const kindLabel: Record<CategoryKind, string> = {
  main: "Main dish",
  add_on: "Add-on",
  drink: "Drink",
};

export function FoodPlaceholder({ categoryKind, compact = false }: FoodPlaceholderProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative isolate overflow-hidden rounded-[1rem] bg-[#edf5ef] ${
        compact ? "h-20 w-20 shrink-0" : "h-48 w-full"
      }`}
    >
      <div className="absolute -right-7 -top-8 size-32 rounded-full bg-[#f7c9a9]/70" />
      <div className="absolute -bottom-10 -left-7 size-32 rounded-full bg-[#c5d5cb]/70" />
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[10px] border-white/80 bg-[#fff8e9] shadow-[0_12px_25px_rgba(20,63,49,0.12)] ${
          compact ? "size-12 border-[5px]" : "size-28"
        }`}
      >
        <div className="absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#e87932]/40" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[0.55rem] font-bold uppercase tracking-[0.16em] text-[#1d5b45]">
          {kindLabel[categoryKind]}
        </span>
      </div>
      {!compact ? (
        <>
          <span className="absolute left-7 top-7 size-3 rounded-full bg-[#e87932]" />
          <span className="absolute bottom-8 right-10 size-2 rounded-full bg-[#1d5b45]" />
          <span className="absolute right-8 top-14 h-8 w-3 rotate-45 rounded-full bg-[#c5d5cb]" />
        </>
      ) : null}
    </div>
  );
}
