import { ItemView } from "obsidian";
import Chart from "chart.js/auto";
import { seriesByRule, type Snapshot } from "./history";

export const PLOT_VIEW = "clean-tracker-plot";

const TIME_FORMAT = new Intl.DateTimeFormat(undefined, { dateStyle: "short", timeStyle: "short" });
const DAY_FORMAT = new Intl.DateTimeFormat(undefined, { dateStyle: "short" });
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
    const legend = this.contentEl.createDiv();
    this.chart = new Chart(container.createEl("canvas"), {
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
        datasets: { line: { cubicInterpolationMode: "monotone", pointRadius: 0 } },
        scales: {
          x: { stacked: true, beginAtZero: true, position: "top" },
          y: {
            type: "linear",
            // End the axis at the first and last snapshots rather than at rounded ticks
            bounds: "data",
            grid: { display: false },
            border: { display: false },
            afterBuildTicks: (scale) => {
              scale.ticks = dayStarts(snapshots).map((time) => ({ value: time }));
            },
            ticks: { callback: (time) => DAY_FORMAT.format(Number(time)) },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { title: ([item]) => TIME_FORMAT.format(Number(item.parsed.y)) } },
        },
      },
    });

    renderLegend(legend, this.chart);
  }

  async onClose() {
    this.chart?.destroy();
  }
}

// renderLegend lists each rule as a dot in its line color, and clicking a rule
// hides or shows its layer like Chart.js's own legend
function renderLegend(el: HTMLElement, chart: Chart) {
  el.empty();
  el.setCssStyles({ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "var(--size-4-3)" });
  for (const label of Chart.defaults.plugins.legend.labels.generateLabels(chart)) {
    const entry = el.createDiv();
    entry.setCssStyles({
      display: "flex",
      alignItems: "center",
      gap: "var(--size-4-1)",
      cursor: "pointer",
      fontSize: "var(--font-ui-small)",
      textDecoration: label.hidden ? "line-through" : "none",
    });
    const dot = entry.createSpan();
    dot.setCssStyles({
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      background: String(label.strokeStyle),
    });
    entry.createSpan({ text: label.text });
    entry.onclick = () => {
      const i = label.datasetIndex!;
      chart.setDatasetVisibility(i, !chart.isDatasetVisible(i));
      chart.update();
      renderLegend(el, chart);
    };
  }
}

// The time of each local day's first snapshot, so the time axis gets one label per day
function dayStarts(snapshots: Snapshot[]): number[] {
  const starts = new Map<string, number>();
  for (const { time } of snapshots) {
    const day = DAY_FORMAT.format(time);
    if (!starts.has(day)) starts.set(day, time);
  }
  return [...starts.values()];
}
