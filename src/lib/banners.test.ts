import { describe, expect, it } from "vitest";
import { stepIndex } from "./banners";

describe("stepIndex", () => {
  it("moves forward and wraps to the first slide", () => {
    expect(stepIndex(0, 3, 1)).toBe(1);
    expect(stepIndex(2, 3, 1)).toBe(0);
  });

  it("moves back and wraps to the last slide", () => {
    expect(stepIndex(1, 3, -1)).toBe(0);
    expect(stepIndex(0, 3, -1)).toBe(2);
  });

  it("stays put with no slide", () => {
    expect(stepIndex(0, 0, 1)).toBe(0);
  });
});
