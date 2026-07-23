export function SparkleIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M11 2L12.8 8.2L19 10L12.8 11.8L11 18L9.2 11.8L3 10L9.2 8.2L11 2Z"
        fill="currentColor"
      />
      <path d="M17.5 2.5L18.2 4.8L20.5 5.5L18.2 6.2L17.5 8.5L16.8 6.2L14.5 5.5L16.8 4.8L17.5 2.5Z" fill="currentColor" />
    </svg>
  );
}

export function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 13V3M8 3L3.5 7.5M8 3L12.5 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PencilIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path
        d="M8.5 1.5L11.5 4.5L4 12H1V9L8.5 1.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AutoDetectIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M9 1.5L10.4 6.6L15.5 8L10.4 9.4L9 14.5L7.6 9.4L2.5 8L7.6 6.6L9 1.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChartTypeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 14V9M9 14V4M15 14V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2 15.5H16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function GridTypeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="13" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.5 7.5H15.5M2.5 12H15.5M7.5 2.5V15.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function MetricTypeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M2 10L5.5 10L7 6.5L9.5 12.5L11 9L13 9L16 9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DonutTypeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="2.4" />
      <path d="M9 2.5A6.5 6.5 0 0 1 15.5 9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}
