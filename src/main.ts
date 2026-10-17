const { Plugin, Notice } = require("obsidian");

module.exports = class CleanTrackerPlugin extends Plugin {
  async onload() {
    this.addRibbonIcon("sparkles", "Clean Tracker", () => {
      new Notice("Hello world!");
    });
  }

  onunload() {}
};
