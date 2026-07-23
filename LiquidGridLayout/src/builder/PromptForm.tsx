import { useState } from "react";
import type { WidgetTypeChoice } from "./types";
import { SUGGESTIONS } from "./datasets";
import {
  AutoDetectIcon,
  ChartTypeIcon,
  DonutTypeIcon,
  GridTypeIcon,
  MetricTypeIcon,
  SparkleIcon,
} from "./components/icons";
import { ChevronIcon } from "../components/ToolbarIcon";

const WIDGET_TYPES: {
  id: WidgetTypeChoice;
  label: string;
  icon: JSX.Element;
}[] = [
  { id: "auto", label: "Auto Detect", icon: <AutoDetectIcon /> },
  { id: "chart", label: "Chart", icon: <ChartTypeIcon /> },
  { id: "grid", label: "Data Grid", icon: <GridTypeIcon /> },
  { id: "metric", label: "Metric", icon: <MetricTypeIcon /> },
  { id: "donut", label: "Allocation", icon: <DonutTypeIcon /> },
];

export function PromptForm({
  initialPrompt,
  initialWidgetType,
  onSubmit,
}: {
  initialPrompt: string;
  initialWidgetType: WidgetTypeChoice;
  onSubmit: (prompt: string, widgetType: WidgetTypeChoice) => void;
}) {
  const [value, setValue] = useState(initialPrompt);
  const [widgetType, setWidgetType] =
    useState<WidgetTypeChoice>(initialWidgetType);
  const [showQuickIdeas, setShowQuickIdeas] = useState(false);

  function submit() {
    if (!value.trim()) return;
    onSubmit(value.trim(), widgetType);
  }

  return (
    <div className="builder-prompt">
      <div className="builder-prompt-header">
        <span className="builder-prompt-badge">
          <SparkleIcon size={18} />
        </span>
        <div>
          <h4 className="builder-prompt-headline">Create AI Widget</h4>
          <p className="builder-prompt-subtext">
            Describe the chart, grid, or metric you want on your canvas
          </p>
        </div>
      </div>
      <div className="builder-prompt-divider" />

      <label className="builder-field-label" htmlFor="builder-prompt-textarea">
        Natural Language Prompt
      </label>
      <div className="builder-prompt-input">
        <textarea
          id="builder-prompt-textarea"
          className="builder-textarea"
          placeholder="e.g. Show monthly revenue by product"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
        />
      </div>

      <span className="builder-field-label">Widget Type</span>
      <div className="builder-type-grid">
        {WIDGET_TYPES.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`builder-type-option ${widgetType === option.id ? "builder-type-option-active" : ""}`}
            onClick={() => setWidgetType(option.id)}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="builder-collapsible-toggle"
        aria-expanded={showQuickIdeas}
        onClick={() => setShowQuickIdeas((v) => !v)}
      >
        <span className="builder-field-label">Quick Ideas</span>
        <span className={showQuickIdeas ? "builder-chevron-open" : ""}>
          <ChevronIcon />
        </span>
      </button>
      {showQuickIdeas && (
        <div className="builder-suggestions">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="builder-chip"
              onClick={() => setValue(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <button type="button" className="builder-cta" onClick={submit}>
        <>
          <SparkleIcon size={16} /> Generate widget
        </>
      </button>
    </div>
  );
}
