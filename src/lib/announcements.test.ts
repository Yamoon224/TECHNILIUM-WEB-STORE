import { describe, expect, it } from "vitest";
import { dismissalValue, isDismissed } from "./announcements";

describe("isDismissed", () => {
  const announcement = { id: 4, version: 1000 };

  it("is false when nothing was stored or the value is unreadable", () => {
    expect(isDismissed(announcement, null)).toBe(false);
    expect(isDismissed(announcement, "not json")).toBe(false);
  });

  it("is true for the announcement that was closed", () => {
    expect(isDismissed(announcement, dismissalValue(announcement))).toBe(true);
  });

  it("is false for another announcement, or the same one after an edit", () => {
    expect(isDismissed({ id: 5, version: 1000 }, dismissalValue(announcement))).toBe(false);
    expect(isDismissed({ id: 4, version: 2000 }, dismissalValue(announcement))).toBe(false);
  });
});
