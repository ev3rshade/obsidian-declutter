import { Plugin, Notice } from "obsidian";
import allNotes from "../rules/all-notes";
import orphan from "../rules/orphan";
import { countMatches } from "./count";
import { buildVaultContext } from "./vault";

export default class CleanTrackerPlugin extends Plugin {
  async onload() {
    this.addRibbonIcon("sparkles", "Count matches", () => {
      const files = this.app.vault.getMarkdownFiles();
      const vault = buildVaultContext(this.app);
      const getCache = (file: typeof files[number]) => this.app.metadataCache.getFileCache(file);

      const total = countMatches(allNotes, files, vault, getCache);
      const orphans = countMatches(orphan, files, vault, getCache);

      const message = `Total files: ${total}\nOrphan files: ${orphans}`;
      console.log(message);
      new Notice(message);
    });
  }

  onunload() {}
}
