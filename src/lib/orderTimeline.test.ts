import { describe, expect, it } from "vitest";
import { formatOrderDate, formatStepDate, timelineFor } from "./orderTimeline";

describe("timelineFor", () => {
  it("marks earlier steps done, the current one, and the rest upcoming", () => {
    expect(timelineFor("confirmed")?.map((step) => step.state)).toEqual(["done", "current", "upcoming", "upcoming"]);
    expect(timelineFor("pending")?.map((step) => step.state)).toEqual(["current", "upcoming", "upcoming", "upcoming"]);
    expect(timelineFor("shipped")?.map((step) => step.state)).toEqual(["done", "done", "current", "upcoming"]);
  });

  it("shows a delivered order as entirely done", () => {
    expect(timelineFor("delivered")?.map((step) => step.state)).toEqual(["done", "done", "done", "done"]);
  });

  it("has no timeline for a cancelled or unknown order", () => {
    expect(timelineFor("cancelled")).toBeNull();
    expect(timelineFor("whatever")).toBeNull();
  });
});

describe("formatOrderDate", () => {
  it("formats an ISO date in French, in UTC", () => {
    expect(formatOrderDate("2026-10-27T23:30:00Z")).toBe("27 octobre 2026");
  });

  it("is null without a usable date", () => {
    expect(formatOrderDate(null)).toBeNull();
    expect(formatOrderDate("pas une date")).toBeNull();
  });
});

describe("timeline dates", () => {
  const history = [
    { status: "pending", at: "2026-10-27T10:00:00Z" },
    { status: "confirmed", at: "2026-10-27T15:00:00Z" },
    { status: "confirmed", at: "2026-10-30T15:00:00Z" },
  ];

  it("attaches the first date each step was reached, null for steps not reached", () => {
    expect(timelineFor("confirmed", history)?.map((step) => step.at)).toEqual([
      "2026-10-27T10:00:00Z",
      "2026-10-27T15:00:00Z",
      null,
      null,
    ]);
  });

  it("works without any history", () => {
    expect(timelineFor("shipped")?.every((step) => step.at === null)).toBe(true);
  });

  it("formats a short step date", () => {
    expect(formatStepDate("2026-10-27T10:00:00Z")).toBe("27 oct.");
    expect(formatStepDate(null)).toBeNull();
  });
});
