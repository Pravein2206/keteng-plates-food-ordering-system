// The "− 2 +" control. Buttons are 44px so they are easy to tap on a phone.
type QuantityStepperProps = {
  itemName: string;
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

const buttonClass =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#c5d5cb] bg-white text-xl font-bold text-[#1d5b45] hover:border-[#1d5b45] hover:bg-[#edf5ef]";

export function QuantityStepper({ itemName, quantity, onDecrease, onIncrease }: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onDecrease}
        aria-label={quantity === 1 ? `Remove ${itemName} from cart` : `Decrease ${itemName}`}
        className={buttonClass}
      >
        −
      </button>
      <span className="min-w-6 text-center font-semibold tabular-nums" aria-live="polite">
        <span className="sr-only">Quantity of {itemName}: </span>
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        aria-label={`Increase ${itemName}`}
        className={buttonClass}
      >
        +
      </button>
    </div>
  );
}
