import type { MetricDataset } from "./types";
import { GeneratedHeader } from "./components/GeneratedHeader";
import { SummaryNote } from "./components/SummaryNote";

export function GeneratedMetric({
  dataset,
  prompt,
  onEdit,
}: {
  dataset: MetricDataset;
  prompt: string;
  onEdit: () => void;
}) {
  return (
    <div className="builder-result">
      <GeneratedHeader prompt={prompt} onEdit={onEdit} />
      <div className="builder-metric">
        <span className="builder-metric-label">{dataset.kpiLabel}</span>
        <span className="builder-metric-value">{dataset.kpiValue}</span>
        <span className={`builder-metric-delta tone-${dataset.deltaPositive ? "positive" : "negative"}`}>
          {dataset.delta}
        </span>
      </div>
      <SummaryNote text={dataset.summaryNote} />
    </div>
  );
}
