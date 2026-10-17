// orphan.ts matches orphan files
// orphan files are files that don't have any incoming links
// and any outgoing links

import type { Rule } from "./rules-api.ts"

const ORPHAN_RULE : Rule = {
  name: "orphan",
  filter: (file, _cache, vaultCtx) => {
    const incoming = vaultCtx.backlinks.get(file.path)?.size ?? 0;
    const outgoing = vaultCtx.outlinks.get(file.path)?.size ?? 0;
    return incoming === 0 && outgoing === 0;
  },
};

export default ORPHAN_RULE;
