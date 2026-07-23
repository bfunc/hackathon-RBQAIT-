import type { DonutDataset } from "./types";
import { GeneratedHeader } from "./components/GeneratedHeader";
import { KpiRow } from "./components/KpiRow";
import { SummaryNote } from "./components/SummaryNote";

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function GeneratedDonut({
  dataset,
  prompt,
  onEdit,
}: {
  dataset: DonutDataset;
  prompt: string;
  onEdit: () => void;
}) {
  let cumulative = 0;

  return (
    <div className="builder-result">
      <GeneratedHeader prompt={prompt} onEdit={onEdit} />
      <KpiRow
        label={dataset.kpiLabel}
        value={dataset.kpiValue}
        delta={dataset.delta}
        positive={dataset.deltaPositive}
      />
      <div className="builder-donut">
        <div className="builder-donut-ring-wrap">
          <svg className="builder-donut-ring" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={RADIUS} className="builder-donut-track" strokeWidth="14" fill="none" />
            {dataset.slices.map((slice) => {
              const length = (slice.pct / 100) * CIRCUMFERENCE;
              const offset = (cumulative / 100) * CIRCUMFERENCE;
              cumulative += slice.pct;
              return (
                <circle
                  key={slice.label}
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="14"
                  strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 50 50)"
                  strokeLinecap="butt"
                />
              );
            })}
          </svg>
          <div className="builder-donut-center">
            <span className="builder-donut-center-label">{dataset.centerLabel}</span>
          </div>
        </div>
        <ul className="builder-donut-legend">
          {dataset.slices.map((slice) => (
            <li key={slice.label}>
              <span className="builder-donut-dot" style={{ background: slice.color }} />
              <span className="builder-donut-legend-label">{slice.label}</span>
              <span className="builder-donut-legend-pct">{slice.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
      <SummaryNote text={dataset.summaryNote} />
    </div>
  );
}
