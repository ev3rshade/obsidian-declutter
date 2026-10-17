// tests/all-notes.test.ts
import { describe, it, expect } from "vitest";
import ALL_NOTES from "../rules/all-notes";
import { countMatches } from "../src/count";
import { indexLinks } from "../src/vault";

describe("all-notes", () => {
  it("matches every file", () => {
    const files = [{ path: "a.md" }, { path: "b.md" }, { path: "c.md" }] as any;
    expect(countMatches(ALL_NOTES, files, indexLinks({}))).toBe(3);
  });
});
