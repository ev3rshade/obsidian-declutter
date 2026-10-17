// vault.ts defines functions that build information about the whole vault

// builds backlinks of vault
// returns as a map
function buildBacklinks(app: App): Map<string, Set<string>> {
  // key is the backlinked file, value is the file containing the backlink
  const back = new Map<string, Set<string>>();

  // loop through all files to look for 
  for (const [src, targets] of Object.entries(app.metadataCache.resolvedLinks)) {
    for (const dst of Object.keys(targets)) {
      if (dst === src) {
	      continue; // ignore self-links
      }
      if (!back.has(dst)) {
	      back.set(dst, new Set());
      }
      back.get(dst).add(src);
    }
  }
  return back;
}
