// tests/history.test.ts
import { describe, it, expect } from "vitest";
import { parseHistory, seriesByRule } from "../src/history";

describe("parseHistory", () => {
  it("starts empty when nothing is saved", () => {
    expect(parseHistory(null)).toEqual([]);
  });

  it("returns saved snapshots", () => {
    const snapshots = [
      { time: 1000, counts: { "All notes": 10, orphan: 2 } },
      { time: 2000, counts: { "All notes": 12, orphan: 1 } },
    ];
    expect(parseHistory({ snapshots })).toEqual(snapshots);
  });

  it("rejects data without a snapshots array", () => {
    expect(() => parseHistory({ counts: {} })).toThrow(/snapshots/);
  });

  it("rejects a snapshot with a non-numeric count", () => {
    const snapshots = [{ time: 1000, counts: { orphan: "2" } }];
    expect(() => parseHistory({ snapshots })).toThrow(/Invalid snapshot/);
  });
});

describe("seriesByRule", () => {
  it("builds one time series per rule", () => {
    const series = seriesByRule([
      { time: 1000, counts: { "All notes": 10, orphan: 2 } },
      { time: 2000, counts: { "All notes": 12, orphan: 1 } },
    ]);
    expect(series.get("All notes")).toEqual([{ x: 10, y: 1000 }, { x: 12, y: 2000 }]);
    expect(series.get("orphan")).toEqual([{ x: 2, y: 1000 }, { x: 1, y: 2000 }]);
  });

  it("counts 0 for a rule in snapshots that did not count it", () => {
    const series = seriesByRule([
      { time: 1000, counts: { "All notes": 10 } },
      { time: 2000, counts: { "All notes": 12, orphan: 1 } },
    ]);
    expect(series.get("orphan")).toEqual([{ x: 0, y: 1000 }, { x: 1, y: 2000 }]);
  });
});
