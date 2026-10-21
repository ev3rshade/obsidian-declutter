// no-template.ts matches notes that don't use a template
// a note uses a template when its frontmatter has every property of that template

import type { Rule } from "./rules-api.ts"

const NO_TEMPLATE_RULE: Rule = {
  name: "No template",
  filter: (_file, cache, vaultCtx) => {
    const properties = new Set(Object.keys(cache?.frontmatter ?? {}));
    return !vaultCtx.templates.some(
      (template) => template.size > 0 && [...template].every((key) => properties.has(key)),
    );
  },
};

export default NO_TEMPLATE_RULE;
