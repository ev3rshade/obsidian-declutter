import { Plugin, Notice } from "obsidian";
import allNotes from "../rules/all-notes";
import orphan from "../rules/orphan";
import { countMatches } from "./count";
import { buildVaultContext } from "./vault";
import { PLOT_VIEW, PlotView } from "./plot";

export default class CleanTrackerPlugin extends Plugin {
  async onload() {
    this.registerView(PLOT_VIEW, (leaf) => new PlotView(leaf));

    this.addRibbonIcon("sparkles", "Count matches", async () => {
      const files = this.app.vault.getMarkdownFiles();
      const vault = buildVaultContext(this.app);
      const getCache = (file: typeof files[number]) => this.app.metadataCache.getFileCache(file);

      const total = countMatches(allNotes, files, vault, getCache);
      const orphans = countMatches(orphan, files, vault, getCache);

      const message = `Total files: ${total}\nOrphan files: ${orphans}`;
      console.log(message);
      new Notice(message);

      const leaf = this.app.workspace.getLeavesOfType(PLOT_VIEW)[0] ?? this.app.workspace.getRightLeaf(false);
      if (!leaf) return;
      await leaf.setViewState({ type: PLOT_VIEW });
      this.app.workspace.revealLeaf(leaf);
      (leaf.view as PlotView).plot({ [allNotes.name]: total, [orphan.name]: orphans });
    });
  }

  onunload() {}
}
