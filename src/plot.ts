import { ItemView } from "obsidian";
import Chart from "chart.js/auto";

export const PLOT_VIEW = "clean-tracker-plot";

// PlotView is a sidebar view that plots each rule's count as a dot
export class PlotView extends ItemView {
  private chart: Chart | null = null;

  getViewType() {
    return PLOT_VIEW;
  }

  getDisplayText() {
    return "Clean tracker";
  }

  plot(counts: Record<string, number>) {
    this.chart?.destroy();
    this.contentEl.empty();
    const canvas = this.contentEl.createEl("canvas");
    this.chart = new Chart(canvas, {
      type: "line",
      data: {
        labels: Object.keys(counts),
        datasets: [{ label: "Notes", data: Object.values(counts), showLine: false }],
      },
    });
  }

  async onClose() {
    this.chart?.destroy();
  }
}
