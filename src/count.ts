// src/count.ts
import type { TFile } from "obsidian";
import type { Rule } from "./rules-api";

export function countMatches(rule: Rule, files: TFile[]): number {
  let n = 0;
  for (const file of files) {
    if (rule.filter(file)) n++;
  }
  return n;
}
