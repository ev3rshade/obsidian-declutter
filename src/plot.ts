import { ItemView } from "obsidian";
import Chart from "chart.js/auto";
import { seriesByRule, type Snapshot } from "./history";

export const PLOT_VIEW = "clean-tracker-plot";

const TIME_FORMAT = new Intl.DateTimeFormat(undefined, { dateStyle: "short", timeStyle: "short" });
const ROW_HEIGHT = 48;

// PlotView is a sidebar view that plots each rule's count over time as a
// stacked area chart, with time running up the y axis so the newest snapshot
// is on top.
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
    // The plot grows downward one row per snapshot, so the view scrolls
    const container = this.contentEl.createDiv();
    container.style.position = "relative";
    container.style.height = `${Math.max(300, snapshots.length * ROW_HEIGHT)}px`;
    const canvas = container.createEl("canvas");
    this.chart = new Chart(canvas, {
      type: "line",
      data: {
        // Chart.js's "stack" fill shades toward the bottom even when time is on
        // the y axis, so fill each layer to the one before it instead
        datasets: [...seriesByRule(snapshots)].map(([rule, points], i) => ({
          label: rule,
          data: points,
          fill: i === 0 ? "origin" : "-1",
        })),
      },
      options: {
        indexAxis: "y",
        maintainAspectRatio: false,
        interaction: { mode: "nearest", axis: "y", intersect: false },
        scales: {
          x: { stacked: true, beginAtZero: true },
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
