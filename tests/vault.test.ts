// tests/vault-context.test.ts
import { describe, it, expect } from "vitest";
import { indexLinks } from "../src/vault";

const sorted = (set: ReadonlySet<string> | undefined) => [...(set ?? [])].sort();

describe("indexLinks", () => {
  const ctx = indexLinks({
    "a.md": { "b.md": 1, "a.md": 1 }, // a links to b, and to itself
    "c.md": { "b.md": 2 },            // c links to b twice
    "d.md": {},                       // d links to nothing
  });

  it("builds backlinks", () => {
    expect(sorted(ctx.backlinks.get("b.md"))).toEqual(["a.md", "c.md"]);
  });

  it("builds outlinks", () => {
    expect(sorted(ctx.outlinks.get("a.md"))).toEqual(["b.md"]);
    expect(sorted(ctx.outlinks.get("c.md"))).toEqual(["b.md"]);
  });

  it("ignores self-links in both directions", () => {
    expect(ctx.backlinks.has("a.md")).toBe(false);
    expect(sorted(ctx.outlinks.get("a.md"))).not.toContain("a.md");
  });

  it("counts repeated links once", () => {
    expect(ctx.backlinks.get("b.md")?.size).toBe(2);
  });

  it("has no entries for notes without links", () => {
    expect(ctx.backlinks.has("d.md")).toBe(false);
    expect(ctx.outlinks.has("d.md")).toBe(false);
  });
});
