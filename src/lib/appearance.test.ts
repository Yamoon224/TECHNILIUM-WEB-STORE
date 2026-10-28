import { describe, expect, it } from "vitest";
import { accentVariables, DEFAULT_APPEARANCE, isHexColor, parseAppearance, resolveTheme, shade } from "./appearance";

describe("resolveTheme", () => {
  it("follows the system only in auto mode", () => {
    expect(resolveTheme("auto", true)).toBe("dark");
    expect(resolveTheme("auto", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});

describe("shade", () => {
  it("lightens toward white and darkens toward black", () => {
    expect(shade("#000000", 0.5)).toBe("#808080");
    expect(shade("#ffffff", -0.5)).toBe("#808080");
  });

  it("leaves an invalid colour alone", () => {
    expect(shade("orange", 0.3)).toBe("orange");
  });
});

describe("isHexColor", () => {
  it("accepts only six-digit hex", () => {
    expect(isHexColor("#f68b1e")).toBe(true);
    expect(isHexColor("#fff")).toBe(false);
    expect(isHexColor("expression(alert(1))")).toBe(false);
  });
});

describe("parseAppearance", () => {
  it("falls back to the defaults for nothing or garbage", () => {
    expect(parseAppearance(null)).toEqual(DEFAULT_APPEARANCE);
    expect(parseAppearance("{oops")).toEqual(DEFAULT_APPEARANCE);
    expect(parseAppearance("7")).toEqual(DEFAULT_APPEARANCE);
  });

  it("keeps valid choices and drops invalid ones", () => {
    expect(parseAppearance(JSON.stringify({ theme: "dark", accent: "#2563eb", language: "en" }))).toEqual({
      theme: "dark",
      accent: "#2563eb",
      language: "en",
    });
    expect(parseAppearance(JSON.stringify({ theme: "neon", accent: "red", language: "de" }))).toEqual(DEFAULT_APPEARANCE);
  });
});

describe("accentVariables", () => {
  it("uses a lighter accent text colour on dark and a darker one on light", () => {
    const light = accentVariables("#2563eb", "light")["--gold-bright"];
    const dark = accentVariables("#2563eb", "dark")["--gold-bright"];

    expect(parseInt(dark.slice(1, 3), 16)).toBeGreaterThan(parseInt(light.slice(1, 3), 16));
  });

  it("sets the accent itself", () => {
    expect(accentVariables("#e11d48", "light")["--gold"]).toBe("#e11d48");
  });
});
