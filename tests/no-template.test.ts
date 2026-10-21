// tests/no-template.test.ts
import { describe, it, expect } from "vitest";
import NO_TEMPLATE from "../rules/no-template";
import { countMatches } from "../src/count";
import { indexLinks } from "../src/vault";

const vault = (templates: string[][]) => ({
  ...indexLinks({}),
  templates: templates.map((keys) => new Set(keys)),
});

const frontmatter: Record<string, Record<string, unknown> | undefined> = {
  "daily.md": { date: "2026-10-21", mood: "ok", extra: 1 },
  "partial.md": { date: "2026-10-21" },
  "book.md": { author: "x", rating: 5 },
  "plain.md": undefined,
};
const files = Object.keys(frontmatter).map((path) => ({ path })) as any;
const getCache = (file: { path: string }) => ({ frontmatter: frontmatter[file.path] }) as any;

describe("no-template", () => {
  it("matches notes missing a property of every template", () => {
    const ctx = vault([["date", "mood"], ["author", "rating"]]);
    expect(countMatches(NO_TEMPLATE, files, ctx, getCache)).toBe(2); // partial, plain
  });

  it("ignores templates without properties", () => {
    expect(countMatches(NO_TEMPLATE, files, vault([[]]), getCache)).toBe(4);
  });

  it("matches every note when there are no templates", () => {
    expect(countMatches(NO_TEMPLATE, files, vault([]), getCache)).toBe(4);
  });
});
