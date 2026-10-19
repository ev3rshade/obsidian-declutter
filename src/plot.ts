import { ItemView } from "obsidian";
import Chart from "chart.js/auto";
import { seriesByRule, type Snapshot } from "./history";

export const PLOT_VIEW = "clean-tracker-plot";

const TIME_FORMAT = new Intl.DateTimeFormat(undefined, { dateStyle: "short", timeStyle: "short" });

// PlotView is a sidebar view that plots each rule's count over time, with
// time running up the y axis so the newest snapshot is on top.
// The y axis is linear over epoch milliseconds because Chart.js's time axis
// needs a separate date adapter package.
export class PlotView extends ItemView {
  private chart: Chart | null = null;

  getViewType() {
    return PLOT_VIEW;
  }

  getDisplayText() {
    return "Clean tracker";
  }

  plot(snapshots: Snapshot[]) {
    this.chart?.destroy();
    this.contentEl.empty();
    const canvas = this.contentEl.createEl("canvas");
    this.chart = new Chart(canvas, {
      type: "line",
      data: {
        datasets: [...seriesByRule(snapshots)].map(([rule, points]) => ({ label: rule, data: points })),
      },
      options: {
        indexAxis: "y",
        scales: {
          y: { type: "linear", ticks: { callback: (time) => TIME_FORMAT.format(Number(time)) } },
        },
        plugins: {
          tooltip: { callbacks: { title: ([item]) => TIME_FORMAT.format(Number(item.parsed.y)) } },
        },
      },
    });
  }

  async onClose() {
    this.chart?.destroy();
  }
}
