// Money is stored and calculated as whole sen (RM1 = 100 sen).
// Only convert to "RM" text at the moment it is shown on screen.

export function formatRinggit(sen: number): string {
  if (!Number.isInteger(sen) || sen < 0) {
    throw new RangeError(`Price must be a whole, non-negative number of sen. Got: ${sen}`);
  }
  const ringgit = Math.floor(sen / 100);
  const cents = sen % 100;
  return `RM${ringgit}.${cents.toString().padStart(2, "0")}`;
}
