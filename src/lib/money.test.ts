import { describe, expect, test } from "vitest";
import { formatRinggit } from "./money";

describe("formatRinggit", () => {
  test("formats whole ringgit with two decimals", () => {
    expect(formatRinggit(1500)).toBe("RM15.00");
    expect(formatRinggit(100)).toBe("RM1.00");
  });

  test("formats ringgit and sen", () => {
    expect(formatRinggit(1490)).toBe("RM14.90");
    expect(formatRinggit(550)).toBe("RM5.50");
    expect(formatRinggit(105)).toBe("RM1.05");
  });

  test("formats amounts under RM1", () => {
    expect(formatRinggit(50)).toBe("RM0.50");
    expect(formatRinggit(0)).toBe("RM0.00");
  });

  test("rejects decimals and negative numbers", () => {
    expect(() => formatRinggit(14.9)).toThrow(RangeError);
    expect(() => formatRinggit(-100)).toThrow(RangeError);
    expect(() => formatRinggit(Number.NaN)).toThrow(RangeError);
  });
});
