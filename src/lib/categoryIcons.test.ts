import { Laptop, LayoutGrid, Smartphone, Tablet, Tv } from "lucide-react";
import { describe, expect, it } from "vitest";
import { categoryIcon } from "./categoryIcons";

describe("categoryIcon", () => {
  it("matches on the name, ignoring case and accents", () => {
    expect(categoryIcon({ name: "Téléphones mobiles", slug: "x" })).toBe(Smartphone);
    expect(categoryIcon({ name: "Tablettes", slug: "x" })).toBe(Tablet);
  });

  it("matches on the slug", () => {
    expect(categoryIcon({ name: "Divers", slug: "ordinateurs-portables" })).toBe(Laptop);
    expect(categoryIcon({ name: "Divers", slug: "tv-audio" })).toBe(Tv);
  });

  it("falls back to a neutral icon for an unknown category", () => {
    expect(categoryIcon({ name: "Jardin", slug: "jardin" })).toBe(LayoutGrid);
  });
});
