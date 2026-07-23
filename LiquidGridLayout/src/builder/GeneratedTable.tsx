import type { GridDataset } from "./types";
import { GeneratedHeader } from "./components/GeneratedHeader";
import { KpiRow } from "./components/KpiRow";
import { SummaryNote } from "./components/SummaryNote";

export function GeneratedTable({
  dataset,
  prompt,
  onEdit,
}: {
  dataset: GridDataset;
  prompt: string;
  onEdit: () => void;
}) {
  return (
    <div className="builder-result">
      <GeneratedHeader prompt={prompt} onEdit={onEdit} />
      <KpiRow
        label={dataset.kpiLabel}
        value={dataset.kpiValue}
        delta={dataset.delta}
        positive={dataset.deltaPositive}
      />
      <table className="builder-table">
        <thead>
          <tr>
            {dataset.columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataset.rows.map((row) => (
            <tr key={row.label}>
              <td>
                <span className="builder-row-swatch" style={{ background: row.swatch }} />
                <span className="builder-row-label">
                  {row.label}
                  {row.sublabel && <span className="builder-row-sublabel">{row.sublabel}</span>}
                </span>
              </td>
              <td>{row.value}</td>
              <td>
                <span className={`builder-status-pill tone-${row.tone}`}>{row.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <SummaryNote text={dataset.summaryNote} />
    </div>
  );
}
