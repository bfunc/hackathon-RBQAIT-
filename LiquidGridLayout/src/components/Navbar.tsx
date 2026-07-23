import { useDashboardDispatch, useDashboardState } from "../state/DashboardContext";
import { SparkleIcon } from "../builder/components/icons";
import { ExportIcon } from "./ToolbarIcon";

function BrandMark() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 1L18 10L10 19L2 10L10 1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 5L14 10L10 15L6 10L10 5Z" fill="currentColor" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 1.5V3M8 13V14.5M14.5 8H13M3 8H1.5M12.4 3.6L11.3 4.7M4.7 11.3L3.6 12.4M12.4 12.4L11.3 11.3M4.7 4.7L3.6 3.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M12.5 7A5.5 5.5 0 1 1 10.4 2.7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path d="M10 1.5L10.5 3.7L8.3 4.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Navbar({
  view,
  onToggleView,
}: {
  view: "dashboard" | "settings";
  onToggleView: () => void;
}) {
  const state = useDashboardState();
  const dispatch = useDashboardDispatch();
  const widgetCount = Object.keys(state.tiles).length;

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">
          <BrandMark />
        </span>
        <span className="navbar-wordmark">
          RBQAIT+
          <span className="navbar-subtitle">DASHBOARD LAB</span>
        </span>
        <span className="navbar-widget-count">{widgetCount} Active Widgets</span>
      </div>

      <div className="navbar-actions">
        {/* Decorative only — demo chrome, not wired to a real generation flow */}
        <button type="button" className="navbar-pill navbar-pill-primary" tabIndex={-1}>
          <SparkleIcon size={14} />
          Generate Widget from Prompt
        </button>
        <button type="button" className="navbar-pill" tabIndex={-1}>
          <ExportIcon />
          Export
        </button>
        <button
          type="button"
          className="navbar-pill"
          onClick={() => dispatch({ type: "RESET_DASHBOARD" })}
        >
          <ResetIcon />
          Reset
        </button>
        <div className="navbar-divider" />
        <button type="button" className="navbar-settings-button" onClick={onToggleView}>
          <GearIcon />
          {view === "settings" ? "Back to Dashboard" : "Settings"}
        </button>
        <div className="navbar-divider" />
        <div className="navbar-user">
          <span className="navbar-user-name">Jordan Lee</span>
          <span className="navbar-user-avatar">JL</span>
        </div>
      </div>
    </header>
  );
}
