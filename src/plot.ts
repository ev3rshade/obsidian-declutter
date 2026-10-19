import { ItemView } from "obsidian";
import Chart from "chart.js/auto";
import { seriesByRule, type Snapshot } from "./history";

export const PLOT_VIEW = "clean-tracker-plot";

const TIME_FORMAT = new Intl.DateTimeFormat(undefined, { dateStyle: "short", timeStyle: "short" });
const DAY_FORMAT = new Intl.DateTimeFormat(undefined, { dateStyle: "short" });
const ROW_HEIGHT = 48;
const AXIS_HEIGHT = 24;
const BORDER = "1px solid var(--background-modifier-border)";
// Chart.js's default palette, set by hand because its automatic colors
// plugin turns off once any dataset picks its own fill
const COLORS = ["54, 162, 235", "255, 99, 132", "255, 159, 64", "255, 205, 86", "75, 192, 192", "153, 102, 255", "201, 203, 207"];
const FILL_OPACITY = 0.12;

// PlotView is a sidebar view that plots each rule's count over time as a
// stacked area chart, with time running up the y axis so the newest snapshot
// is on top.
// The y axis is linear over epoch milliseconds because Chart.js's time axis
// needs a separate date adapter package.
// Chart.js can't pin one axis while the rest of a chart scrolls, so the count
// axis labels are HTML placed from the plot's own scale.
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
    this.contentEl.setCssStyles({ display: "flex", flexDirection: "column", gap: "var(--size-4-2)" });

    // A bordered box fills the view, with the count axis fixed at its top and
    // the plot scrolling beneath it, one row per snapshot
    const box = this.contentEl.createDiv();
    box.setCssStyles({
      flex: "1",
      minHeight: "0",
      display: "flex",
      flexDirection: "column",
      border: BORDER,
      borderRadius: "var(--radius-s)",
      overflow: "hidden",
    });
    const axis = box.createDiv();
    axis.setCssStyles({ position: "relative", flexShrink: "0", height: `${AXIS_HEIGHT}px`, borderBottom: BORDER });
    // The plot still scrolls, just without a visible scrollbar
    const scroller = box.createDiv();
    scroller.setCssStyles({ flex: "1", minHeight: "0", overflowY: "auto", scrollbarWidth: "none" });
    const plotContainer = scroller.createDiv();
    plotContainer.setCssStyles({
      position: "relative",
      height: `${snapshots.length * ROW_HEIGHT}px`,
      minHeight: "100%",
    });
    const legend = this.contentEl.createDiv();

    this.chart = new Chart(plotContainer.createEl("canvas"), {
      type: "line",
      data: {
        // Chart.js's "stack" fill shades toward the bottom even when time is on
        // the y axis, so fill each layer to the one before it instead
        datasets: [...seriesByRule(snapshots)].map(([rule, points], i) => {
          const color = COLORS[i % COLORS.length];
          return {
            label: rule,
            data: points,
            fill: i === 0 ? "origin" : "-1",
            borderColor: `rgb(${color})`,
            backgroundColor: `rgba(${color}, ${FILL_OPACITY})`,
          };
        }),
      },
      options: {
        indexAxis: "y",
        maintainAspectRatio: false,
        interaction: { mode: "nearest", axis: "y", intersect: false },
        datasets: { line: { cubicInterpolationMode: "monotone", pointRadius: 0 } },
        scales: {
          // The axis strip shows the count labels, so the plot keeps only the gridlines
          x: {
            stacked: true,
            beginAtZero: true,
            position: "top",
            ticks: { display: false },
            grid: { drawTicks: false },
            border: { display: false },
          },
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
      // Relabel the axis whenever the plot's count range or width changes
      plugins: [{ id: "countAxis", afterLayout: (chart) => renderCountAxis(axis, chart) }],
    });

    renderLegend(legend, this.chart);
  }

  async onClose() {
    this.chart?.destroy();
  }
}

// renderCountAxis puts each of the plot's count ticks above its gridline,
// nudging the end labels inward so they stay inside the strip
function renderCountAxis(el: HTMLElement, chart: Chart) {
  el.empty();
  const scale = chart.scales.x;
  for (const tick of scale.ticks) {
    const label = el.createSpan({ text: String(tick.label) });
    label.setCssStyles({
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      color: "var(--text-muted)",
      fontSize: "var(--font-ui-smaller)",
      whiteSpace: "nowrap",
    });
    const width = label.offsetWidth;
    const left = scale.getPixelForValue(tick.value) - width / 2;
    label.style.left = `${Math.min(Math.max(left, 0), el.clientWidth - width)}px`;
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
