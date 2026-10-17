// tests/all-notes.test.ts
import { describe, it, expect } from "vitest";
import rule from "../rules/all-notes";
import { countMatches } from "../src/count";

describe("all-notes", () => {
  it("matches every file", () => {
    const files = [{ path: "a.md" }, { path: "b.md" }, { path: "c.md" }] as any;
    expect(countMatches(rule, files)).toBe(3);
  });
});
