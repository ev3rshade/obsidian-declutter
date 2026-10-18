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
    expect(series.get("All notes")).toEqual([{ x: 1000, y: 10 }, { x: 2000, y: 12 }]);
    expect(series.get("orphan")).toEqual([{ x: 1000, y: 2 }, { x: 2000, y: 1 }]);
  });

  it("starts a rule's series at the first snapshot that counted it", () => {
    const series = seriesByRule([
      { time: 1000, counts: { "All notes": 10 } },
      { time: 2000, counts: { "All notes": 12, orphan: 1 } },
    ]);
    expect(series.get("orphan")).toEqual([{ x: 2000, y: 1 }]);
  });
});
