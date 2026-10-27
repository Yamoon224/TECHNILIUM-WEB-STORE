import { describe, expect, it } from "vitest";
import { countLabel, formatAverage, ineligibleMessage, sharePercent, stars } from "./reviews";

describe("review display helpers", () => {
  it("formats the average with a decimal comma", () => {
    expect(formatAverage(4.3)).toBe("4,3");
    expect(formatAverage(5)).toBe("5,0");
    expect(formatAverage(0)).toBe("0,0");
  });

  it("draws filled and empty stars, clamped to 1-5", () => {
    expect(stars(4)).toBe("★★★★☆");
    expect(stars(5)).toBe("★★★★★");
    expect(stars(0)).toBe("☆☆☆☆☆");
    expect(stars(9)).toBe("★★★★★");
    expect(stars(3.6)).toBe("★★★★☆");
  });

  it("computes the share of a star count, safely with no reviews", () => {
    expect(sharePercent(3, 4)).toBe(75);
    expect(sharePercent(1, 3)).toBe(33);
    expect(sharePercent(0, 0)).toBe(0);
  });

  it("labels the review count", () => {
    expect(countLabel(0)).toBe("Aucun avis");
    expect(countLabel(1)).toBe("1 avis");
    expect(countLabel(12)).toBe("12 avis");
  });

  it("explains why a customer cannot review, and says nothing when they can", () => {
    expect(ineligibleMessage({ can_review: true, reason: null })).toBeNull();
    expect(ineligibleMessage({ can_review: false, reason: "not_purchased" })).toContain("reçu ce produit");
    expect(ineligibleMessage({ can_review: false, reason: "already_reviewed" })).toContain("déjà");
    expect(ineligibleMessage({ can_review: false, reason: null })).toBeNull();
  });
});
