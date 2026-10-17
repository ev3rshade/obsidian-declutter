// vault.ts defines functions that build information about the whole vault

import type { App, MetadataCache } from "obsidian";

// Vault-wide information passed to every rule
export interface VaultContext {
  readonly backlinks: ReadonlyMap<string, ReadonlySet<string>>;
  readonly outlinks: ReadonlyMap<string, ReadonlySet<string>>;
}

export function buildVaultContext(app: App): VaultContext {
  return indexLinks(app.metadataCache.resolvedLinks);
}

// inverts links of vault, ignoring self links
export function indexLinks(resolvedLinks: MetadataCache["resolvedLinks"]): VaultContext {
  const backlinks = new Map<string, Set<string>>();
  const outlinks = new Map<string, Set<string>>();
  for (const [src, targets] of Object.entries(resolvedLinks)) {
    for (const target of Object.keys(targets)) {
      if (target === src) {
	      continue; // ignore self-links
      }

      addTo(backlinks, target, src);
      addTo(outlinks, src, target);
    }
  }
  return { backlinks, outlinks };
}

function addTo(map: Map<string, Set<string>>, key: string, value: string): void {
  let set = map.get(key);
  if (!set) {
    set = new Set();
    map.set(key, set);
  }
  set.add(value);
}
