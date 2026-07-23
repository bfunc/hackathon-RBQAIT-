export function KpiRow({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}) {
  return (
    <div className="builder-kpi-row">
      <span className="builder-kpi-label">{label}</span>
      <span className="builder-kpi-value">
        {value}
        <span className={`builder-kpi-delta ${positive ? "tone-positive" : "tone-negative"}`}>
          {delta}
        </span>
      </span>
    </div>
  );
}
