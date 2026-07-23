export type BuilderMode = "prompt" | "loading" | "result";

export type WidgetTypeChoice = "auto" | "chart" | "grid" | "metric" | "donut";

export interface BuilderConfig extends Record<string, unknown> {
  mode: BuilderMode;
  prompt?: string;
  widgetType?: WidgetTypeChoice;
  category?: string;
}

export type StatusTone = "positive" | "warning" | "neutral";

export interface TableRow {
  label: string;
  sublabel?: string;
  value: string;
  status: string;
  tone: StatusTone;
  swatch: string;
}

interface DatasetBase {
  title: string;
  category: string;
  kpiLabel: string;
  kpiValue: string;
  delta: string;
  deltaPositive: boolean;
  summaryNote?: string;
}

export interface GridDataset extends DatasetBase {
  kind: "grid";
  columns: [string, string, string];
  rows: TableRow[];
}

export interface GraphDataset extends DatasetBase {
  kind: "graph";
  bars: number[];
  barLabels?: string[];
  peakLabel: string;
}

export interface MetricDataset extends DatasetBase {
  kind: "metric";
}

export interface DonutSlice {
  label: string;
  pct: number;
  color: string;
}

export interface DonutDataset extends DatasetBase {
  kind: "donut";
  centerLabel: string;
  slices: DonutSlice[];
}

export type Dataset = GridDataset | GraphDataset | MetricDataset | DonutDataset;
