import { describe, expect, it } from "vitest";
import { totalAfterDiscount } from "./coupons";

describe("totalAfterDiscount", () => {
  it("takes the discount off the subtotal", () => {
    expect(totalAfterDiscount(100_000, 10_000)).toBe(90_000);
  });

  it("never goes below zero", () => {
    expect(totalAfterDiscount(5_000, 8_000)).toBe(0);
  });

  it("ignores a negative discount", () => {
    expect(totalAfterDiscount(5_000, -1_000)).toBe(5_000);
  });
});
