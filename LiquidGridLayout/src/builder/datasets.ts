import type { Dataset, DonutDataset, GraphDataset, GridDataset, MetricDataset, WidgetTypeChoice } from "./types";

// Fixed, demo-safe mock datasets — deterministic keyword matching (not a
// real LLM call) so the same prompt always produces the same result and a
// live demo never shows something odd or inconsistent.

const REVENUE: GridDataset = {
  kind: "grid",
  title: "Monthly Revenue by Product",
  category: "Revenue",
  kpiLabel: "Monthly revenue",
  kpiValue: "$184,240",
  delta: "+12.4%",
  deltaPositive: true,
  columns: ["PRODUCT", "REVENUE", "OF PLAN"],
  rows: [
    { label: "Core Platform", sublabel: "Subscriptions", value: "$92,400", status: "114%", tone: "positive", swatch: "#6e56e8" },
    { label: "Analytics API", sublabel: "Usage-based", value: "$54,180", status: "101%", tone: "positive", swatch: "#4c8dff" },
    { label: "Mobile Suite", sublabel: "Subscriptions", value: "$37,660", status: "89%", tone: "warning", swatch: "#e8a33d" },
  ],
  summaryNote: "Core Platform and Analytics API exceeded target goals for this fiscal month.",
};

const USERS: GraphDataset = {
  kind: "graph",
  title: "Active User Growth",
  category: "Growth",
  kpiLabel: "Active users",
  kpiValue: "12,840",
  delta: "+18.2%",
  deltaPositive: true,
  bars: [38, 45, 41, 52, 60, 74, 88],
  barLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  peakLabel: "12.8k",
  summaryNote: "Weekly active account creation increased following the new onboarding flow.",
};

const TRANSACTIONS: GridDataset = {
  kind: "grid",
  title: "Recent Transactions",
  category: "Transactions",
  kpiLabel: "Processed today",
  kpiValue: "$18,930",
  delta: "+4.1%",
  deltaPositive: true,
  columns: ["ENTITY", "AMOUNT", "STATUS"],
  rows: [
    { label: "Northwind Traders", sublabel: "Wire transfer", value: "$1,240", status: "Settled", tone: "positive", swatch: "#6e56e8" },
    { label: "Contoso Ltd", sublabel: "ACH transfer", value: "$860", status: "Pending", tone: "warning", swatch: "#4c8dff" },
    { label: "Fabrikam Inc", sublabel: "Card batch", value: "$2,050", status: "Settled", tone: "positive", swatch: "#e8a33d" },
  ],
  summaryNote: "Daily processed transaction volume is tracking 4.1% above projected target.",
};

const TREND: GraphDataset = {
  kind: "graph",
  title: "Weekly Trend Overview",
  category: "Growth",
  kpiLabel: "This week",
  kpiValue: "6,410",
  delta: "+7.6%",
  deltaPositive: true,
  bars: [30, 42, 38, 50, 47, 58, 63],
  barLabels: ["M", "T", "W", "T", "F", "S", "S"],
  peakLabel: "6.4k",
  summaryNote: "Highest activity occurred during Friday close.",
};

// Trading-desk flavored set — a second, separate demo narrative alongside
// the general-business one above (kept as its own seed, not a replacement).

const DEALS: GridDataset = {
  kind: "grid",
  title: "Recent Deals",
  category: "Deals",
  kpiLabel: "Deal volume today",
  kpiValue: "$2.4M",
  delta: "+9.2%",
  deltaPositive: true,
  columns: ["CLIENT", "SIZE", "STATUS"],
  rows: [
    { label: "Meridian Capital", sublabel: "FX Spot", value: "$680,000", status: "Filled", tone: "positive", swatch: "#6e56e8" },
    { label: "Harlow & Voss", sublabel: "Fixed Income", value: "$1,150,000", status: "Pending", tone: "warning", swatch: "#4c8dff" },
    { label: "Blackrun Partners", sublabel: "Equity Block", value: "$570,000", status: "Filled", tone: "positive", swatch: "#e8a33d" },
  ],
  summaryNote: "Deal flow is running ahead of desk average for this time of day.",
};

const CLIENTS: GraphDataset = {
  kind: "graph",
  title: "Active Clients",
  category: "Clients",
  kpiLabel: "Active clients",
  kpiValue: "1,284",
  delta: "+6.1%",
  deltaPositive: true,
  bars: [40, 46, 44, 55, 58, 66, 72],
  barLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  peakLabel: "1.28k",
  summaryNote: "New client onboarding accelerated after the desk coverage expansion.",
};

const GAIN: GraphDataset = {
  kind: "graph",
  title: "Realized Gain",
  category: "Gain",
  kpiLabel: "Realized gain (MTD)",
  kpiValue: "$612,400",
  delta: "+15.8%",
  deltaPositive: true,
  bars: [22, 35, 30, 48, 52, 61, 70],
  barLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  peakLabel: "$70k",
  summaryNote: "Gains are broad-based across desks, led by FX and rates.",
};

const ALLOCATION: DonutDataset = {
  kind: "donut",
  title: "Book Allocation by Asset Class",
  category: "Allocation",
  kpiLabel: "Total exposure",
  kpiValue: "$14.2M",
  delta: "+3.8%",
  deltaPositive: true,
  centerLabel: "100%",
  slices: [
    { label: "FX", pct: 45, color: "#6e56e8" },
    { label: "Rates", pct: 30, color: "#4c8dff" },
    { label: "Equities", pct: 15, color: "#3ecf8e" },
    { label: "Credit", pct: 10, color: "#e8a33d" },
  ],
  summaryNote: "Hedge ratio is optimal with low value-at-risk across the book.",
};

const KEYWORD_RULES: { keywords: string[]; dataset: GridDataset | GraphDataset }[] = [
  { keywords: ["revenue", "sales", "income", "earning"], dataset: REVENUE },
  { keywords: ["user", "growth", "engagement", "signup", "signups"], dataset: USERS },
  { keywords: ["transaction", "order", "payment", "invoice"], dataset: TRANSACTIONS },
  { keywords: ["deal"], dataset: DEALS },
  { keywords: ["client"], dataset: CLIENTS },
  { keywords: ["gain", "p&l", "profit"], dataset: GAIN },
];

export const SUGGESTIONS = [
  "Show monthly revenue by product",
  "Show active user growth",
  "Show recent transactions",
];

function matchByKeyword(prompt: string): GridDataset | GraphDataset {
  const lower = prompt.toLowerCase();
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((keyword) => lower.includes(keyword))) return rule.dataset;
  }
  return TREND;
}

function asMetric(source: GridDataset | GraphDataset): MetricDataset {
  return {
    kind: "metric",
    title: source.title,
    category: source.category,
    kpiLabel: source.kpiLabel,
    kpiValue: source.kpiValue,
    delta: source.delta,
    deltaPositive: source.deltaPositive,
    summaryNote: source.summaryNote,
  };
}

/** Backward-compatible plain keyword match (grid/graph only). */
export function matchDataset(prompt: string): GridDataset | GraphDataset {
  return matchByKeyword(prompt);
}

/** Resolves the mock result honoring the user's Widget Type selection. */
export function deriveDataset(prompt: string, widgetType: WidgetTypeChoice = "auto"): Dataset {
  const matched = matchByKeyword(prompt);

  switch (widgetType) {
    case "chart":
      return matched.kind === "graph" ? matched : TREND;
    case "grid":
      return matched.kind === "grid" ? matched : REVENUE;
    case "metric":
      return asMetric(matched);
    case "donut":
      return ALLOCATION;
    case "auto":
    default:
      return matched;
  }
}
