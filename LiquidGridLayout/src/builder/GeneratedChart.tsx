import type { GraphDataset } from "./types";
import { GeneratedHeader } from "./components/GeneratedHeader";
import { KpiRow } from "./components/KpiRow";
import { SummaryNote } from "./components/SummaryNote";

export function GeneratedChart({
  dataset,
  prompt,
  onEdit,
}: {
  dataset: GraphDataset;
  prompt: string;
  onEdit: () => void;
}) {
  const max = Math.max(...dataset.bars);

  return (
    <div className="builder-result">
      <GeneratedHeader prompt={prompt} onEdit={onEdit} />
      <KpiRow
        label={dataset.kpiLabel}
        value={dataset.kpiValue}
        delta={dataset.delta}
        positive={dataset.deltaPositive}
      />
      <div className="builder-chart">
        <span className="builder-chart-peak">{dataset.peakLabel}</span>
        <div className="builder-chart-bars">
          {dataset.bars.map((height, i) => (
            <div
              key={i}
              className="builder-bar"
              style={{
                height: `${(height / max) * 100}%`,
                animationDelay: `${i * 45}ms`,
              }}
            />
          ))}
        </div>
        {dataset.barLabels && (
          <div className="builder-chart-labels">
            {dataset.barLabels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
        )}
      </div>
      <SummaryNote text={dataset.summaryNote} />
    </div>
  );
}
