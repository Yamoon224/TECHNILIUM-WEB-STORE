import { afterEach, describe, expect, it, vi } from "vitest";
import { adoptFromAccount, preferencesToSave, savePreferences } from "./preferences";

afterEach(() => vi.unstubAllGlobals());

describe("adoptFromAccount", () => {
  it("takes the account's language and colour", () => {
    expect(adoptFromAccount({ locale: "en", accent_color: "#2563eb" })).toEqual({ language: "en", accent: "#2563eb" });
  });

  it("keeps the device's colour when the account has none", () => {
    expect(adoptFromAccount({ locale: "fr", accent_color: null })).toEqual({ language: "fr" });
  });

  it("ignores unsupported values", () => {
    expect(adoptFromAccount({ locale: "de", accent_color: "red" })).toEqual({});
  });
});

describe("preferencesToSave", () => {
  const account = { locale: "fr", accent_color: null };

  it("is null when the device matches the account (the default colour counts as none)", () => {
    expect(preferencesToSave({ language: "fr", accent: "#f68b1e", theme: "auto" }, account)).toBeNull();
    expect(preferencesToSave({ language: "en", accent: "#2563EB", theme: "auto" }, { locale: "en", accent_color: "#2563eb" })).toBeNull();
  });

  it("sends only what changed", () => {
    expect(preferencesToSave({ language: "en", accent: "#f68b1e", theme: "auto" }, account)).toEqual({ locale: "en" });
    expect(preferencesToSave({ language: "fr", accent: "#2563eb", theme: "auto" }, account)).toEqual({ accent_color: "#2563eb" });
  });

  it("sends null to go back to the default colour", () => {
    expect(preferencesToSave({ language: "fr", accent: "#f68b1e", theme: "auto" }, { locale: "fr", accent_color: "#2563eb" })).toEqual({ accent_color: null });
  });
});

describe("savePreferences", () => {
  it("puts the patch with the token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ locale: "en", accent_color: null }) });
    vi.stubGlobal("fetch", fetchMock);

    await savePreferences("tok", { locale: "en" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/auth/preferences");
    expect(init.method).toBe("PUT");
    expect(init.headers.Authorization).toBe("Bearer tok");
    expect(JSON.parse(init.body)).toEqual({ locale: "en" });
  });

  it("throws on a refusal", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 422 }));

    await expect(savePreferences("tok", { locale: "en" })).rejects.toThrow();
  });
});

describe("theme in the account", () => {
  it("is adopted when stored, left alone when the account has none", () => {
    expect(adoptFromAccount({ locale: "fr", accent_color: null, theme: "dark" })).toEqual({ language: "fr", theme: "dark" });
    expect(adoptFromAccount({ locale: "fr", accent_color: null, theme: null })).toEqual({ language: "fr" });
  });

  it("is saved when it differs, with automatic stored as null", () => {
    const account = { locale: "fr", accent_color: null, theme: null };

    expect(preferencesToSave({ language: "fr", accent: "#f68b1e", theme: "dark" }, account)).toEqual({ theme: "dark" });
    expect(preferencesToSave({ language: "fr", accent: "#f68b1e", theme: "auto" }, account)).toBeNull();
    expect(preferencesToSave({ language: "fr", accent: "#f68b1e", theme: "auto" }, { ...account, theme: "dark" })).toEqual({ theme: null });
  });
});
