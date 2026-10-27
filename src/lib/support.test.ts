import { describe, expect, it } from "vitest";
import { canReply, needsYourReply, type TicketStatus } from "./support";

describe("support helpers", () => {
  it("accepts a reply on every status but closed", () => {
    for (const status of ["open", "pending_customer", "resolved"] as TicketStatus[]) {
      expect(canReply(status)).toBe(true);
    }
    expect(canReply("closed")).toBe(false);
  });

  it("highlights only the tickets waiting on the customer", () => {
    expect(needsYourReply("pending_customer")).toBe(true);
    expect(needsYourReply("open")).toBe(false);
    expect(needsYourReply("resolved")).toBe(false);
  });
});
