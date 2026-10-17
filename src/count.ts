// src/count.ts
import type { CachedMetadata, TFile } from "obsidian";
import type { Rule } from "../rules/rules-api";
import type { VaultContext } from "./vault";

export function countMatches(
  rule: Rule,
  files: TFile[],
  vault: VaultContext,
  getCache: (file: TFile) => CachedMetadata | null = () => null,
): number {
  let n = 0;
  for (const file of files) {
    if (rule.filter(file, getCache(file), vault)) n++;
  }
  return n;
}
