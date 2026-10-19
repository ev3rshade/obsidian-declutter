// history.ts defines the saved timeline of rule counts

// Counts of every rule at one moment, keyed by rule name
export interface Snapshot {
  time: number;
  counts: Record<string, number>;
}

// raw is whatever Plugin.loadData() returned; null means nothing saved yet
export function parseHistory(raw: unknown): Snapshot[] {
  if (raw === null) return [];
  if (!isRecord(raw) || !Array.isArray(raw.snapshots)) {
    throw new Error(`Expected data.json to hold { snapshots: [...] }, got ${JSON.stringify(raw)}`);
  }
  const bad = raw.snapshots.find((snapshot) => !isSnapshot(snapshot));
  if (bad !== undefined) {
    throw new Error(`Invalid snapshot in data.json: ${JSON.stringify(bad)}`);
  }
  return raw.snapshots as Snapshot[];
}

// One series of (count, time) points per rule, in snapshot order. Every series
// has a point at every snapshot, counting 0 where a snapshot did not count the
// rule, so stacked layers line up.
export function seriesByRule(snapshots: Snapshot[]): Map<string, { x: number; y: number }[]> {
  const rules = new Set(snapshots.flatMap(({ counts }) => Object.keys(counts)));
  return new Map(
    [...rules].map((rule) => [rule, snapshots.map(({ time, counts }) => ({ x: counts[rule] ?? 0, y: time }))]),
  );
}

function isSnapshot(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.time === "number" &&
    isRecord(value.counts) &&
    Object.values(value.counts).every((count) => typeof count === "number")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
