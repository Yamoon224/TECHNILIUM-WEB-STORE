import { describe, expect, it } from "vitest";
import { ERROR_PAGES, errorCodes, errorInfo } from "./errors";
import { PHRASES_EN } from "./phrases";

describe("errorInfo", () => {
  it("finds the page of a code, given as a number or as text", () => {
    expect(errorInfo(404)?.title).toBe("Page introuvable");
    expect(errorInfo("503")?.retryable).toBe(true);
  });

  it("knows nothing about other codes or garbage", () => {
    expect(errorInfo(418)).toBeNull();
    expect(errorInfo("abc")).toBeNull();
    expect(errorInfo("40x")).toBeNull();
  });

  it("offers the sign-in page for 401 only, and a retry for temporary problems only", () => {
    expect(ERROR_PAGES.filter((page) => page.signIn).map((page) => page.code)).toEqual([401]);
    expect(ERROR_PAGES.filter((page) => !page.retryable).map((page) => page.code)).toEqual([400, 401, 403, 404]);
  });

  it("lists each code once", () => {
    expect(new Set(errorCodes()).size).toBe(ERROR_PAGES.length);
  });
});

describe("error page texts", () => {
  it("have an English wording", () => {
    const missing = ERROR_PAGES.flatMap((page) => [page.title, page.message]).filter((text) => !(text in PHRASES_EN));

    expect(missing).toEqual([]);
  });
});
