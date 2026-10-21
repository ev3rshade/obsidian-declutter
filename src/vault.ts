// vault.ts defines functions that build information about the whole vault

import type { App, MetadataCache } from "obsidian";

export interface LinkIndex {
  readonly backlinks: ReadonlyMap<string, ReadonlySet<string>>;
  readonly outlinks: ReadonlyMap<string, ReadonlySet<string>>;
}

// Vault-wide information passed to every rule
export interface VaultContext extends LinkIndex {
  // frontmatter property names of each note in the templates folder
  readonly templates: readonly ReadonlySet<string>[];
}

export function buildVaultContext(app: App): VaultContext {
  return { ...indexLinks(app.metadataCache.resolvedLinks), templates: templateProperties(app) };
}

// inverts links of vault, ignoring self links
export function indexLinks(resolvedLinks: MetadataCache["resolvedLinks"]): LinkIndex {
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

function templateProperties(app: App): ReadonlySet<string>[] {
  const folder = templateFolder(app);
  if (!folder) return [];
  return app.vault.getMarkdownFiles()
    .filter((file) => file.path.startsWith(`${folder}/`))
    .map((file) => new Set(Object.keys(app.metadataCache.getFileCache(file)?.frontmatter ?? {})));
}

// the core Templates plugin's folder setting isn't part of Obsidian's public API
function templateFolder(app: App): string | undefined {
  const templates = (app as any).internalPlugins?.getPluginById("templates");
  return templates?.instance?.options?.folder?.replace(/\/+$/, "") || undefined;
}
