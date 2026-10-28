import { describe, expect, it } from "vitest";
import { discountPercent } from "./pricing";

const offer = (price: number, compare: number | null, currency: "XOF" | "EUR" = "XOF") => ({
  price: { amount: price, currency: "XOF" as const },
  compare_at_price: compare === null ? null : { amount: compare, currency },
});

describe("discountPercent", () => {
  it("rounds the reduction to a whole percentage", () => {
    expect(discountPercent(offer(68_000, 100_000))).toBe(32);
    expect(discountPercent(offer(2_000, 3_000))).toBe(33);
  });

  it("is null without a reference price", () => {
    expect(discountPercent(offer(10_000, null))).toBeNull();
  });

  it("is null when the offer is not cheaper", () => {
    expect(discountPercent(offer(10_000, 10_000))).toBeNull();
    expect(discountPercent(offer(12_000, 10_000))).toBeNull();
  });

  it("is null across currencies and for a reference of zero", () => {
    expect(discountPercent(offer(5_000, 9_000, "EUR"))).toBeNull();
    expect(discountPercent(offer(0, 0))).toBeNull();
  });

  it("ignores a reduction below one percent", () => {
    expect(discountPercent(offer(99_999, 100_000))).toBeNull();
  });
});
