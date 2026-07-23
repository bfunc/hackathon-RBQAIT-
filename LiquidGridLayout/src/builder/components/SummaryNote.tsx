function InfoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
      <path d="M6 5.5V8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <circle cx="6" cy="3.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function SummaryNote({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p className="builder-summary-note">
      <InfoIcon />
      {text}
    </p>
  );
}
