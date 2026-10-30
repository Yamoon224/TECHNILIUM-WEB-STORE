import { describe, expect, it } from "vitest";
import { closeDecision, decideDisplay } from "./announcements";

const until = { id: 4, version: 1000, max_displays: null };
const three = { id: 4, version: 1000, max_displays: 3 };

describe("announcement without a display count", () => {
  it("shows until the visitor closes it, and stays closed", () => {
    expect(decideDisplay(until, null, null).show).toBe(true);

    const closed = closeDecision(until, null).state;
    expect(decideDisplay(until, closed, null).show).toBe(false);
  });

  it("comes back after an edit or for another announcement", () => {
    const closed = closeDecision(until, null).state;
    expect(decideDisplay({ ...until, version: 2000 }, closed, null).show).toBe(true);
    expect(decideDisplay({ ...until, id: 5 }, closed, null).show).toBe(true);
  });
});

describe("announcement with a display count", () => {
  it("is shown on the first N visits, then no more", () => {
    let stored: string | null = null;
    const shownOn: boolean[] = [];

    for (let visit = 0; visit < 5; visit++) {
      // A new visit = a new browser session.
      const decision = decideDisplay(three, stored, null);
      shownOn.push(decision.show);
      if (decision.state) stored = decision.state;
    }

    expect(shownOn).toEqual([true, true, true, false, false]);
  });

  it("does not count a reload or another page of the same visit again", () => {
    const first = decideDisplay(three, null, null);
    expect(first.show).toBe(true);

    const again = decideDisplay(three, first.state, first.session);
    expect(again.show).toBe(true);
    expect(again.state).toBeNull();
  });

  it("closing only closes it for the current visit", () => {
    const first = decideDisplay(three, null, null);
    const closed = closeDecision(three, first.state);
    expect(closed.state).toBeNull();

    expect(decideDisplay(three, first.state, closed.session).show).toBe(false);
    // Next visit (no session record): shown again, count 2 of 3.
    expect(decideDisplay(three, first.state, null).show).toBe(true);
  });

  it("starts over after an edit", () => {
    let stored: string | null = null;
    for (let visit = 0; visit < 3; visit++) stored = decideDisplay(three, stored, null).state ?? stored;
    expect(decideDisplay(three, stored, null).show).toBe(false);
    expect(decideDisplay({ ...three, version: 2000 }, stored, null).show).toBe(true);
  });
});
