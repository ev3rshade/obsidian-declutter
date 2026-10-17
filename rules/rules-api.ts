// rules/rules-api.ts defines the types and functions shared by all rule files
import type { CachedMetadata, TFile } from "obsidian"
import type { VaultContext } from "../src/vault"

export interface Rule {
  name: string;
  filter: (file: TFile, cache: CachedMetadata | null, vault: VaultContext) => boolean;
}
