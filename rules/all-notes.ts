// `all-notes.ts` is a basic rule that matches all notes

import type { Rule } from "./rules-api.ts"

const ALL_NOTES: Rule = {
  name: "All notes",
  filter: () => true,
};
export default ALL_NOTES;
