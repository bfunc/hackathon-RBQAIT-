import type { Dispatch } from "react";
import type { WidgetDef } from "../types";
import type { DashboardAction } from "../state/dashboardReducer";
import { BuilderWidget, BUILDER_DEFAULT_SIZE } from "../builder";

export interface GridSize {
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export type WidgetUpdater = (patch: {
  title?: string;
  config?: Record<string, unknown>;
  // Adjusts the tile's grid footprint. Partial on purpose — e.g. relaxing
  // minW once a result renders shouldn't also force a specific w/h; "Edit
  // prompt" passing the full BUILDER_DEFAULT_SIZE does reset w/h/minW back
  // to default, though.
  resize?: Partial<GridSize>;
}) => void;

export interface WidgetRegistryEntry {
  type: string;
  title: string;
  defaultConfig: Record<string, unknown>;
  // Grid size (in cols/rows) used for the drop placeholder and the tile
  // actually created on drop. Omit to fall back to GridArea's default 4x4.
  defaultSize?: GridSize;
  // `update` is optional — most widgets are dumb render(config)-only. It's
  // only used by widgets (like the AI builder) that need to rewrite their
  // own title/config, e.g. transforming from a prompt into a generated view.
  render: (config: Record<string, unknown>, update: WidgetUpdater) => JSX.Element;
}

export const widgetRegistry: Record<string, WidgetRegistryEntry> = {
  builder: {
    type: "builder",
    title: "AI Builder",
    defaultConfig: { mode: "prompt" },
    defaultSize: BUILDER_DEFAULT_SIZE,
    render: (config, update) => <BuilderWidget config={config} update={update} />,
  },
};

export function renderWidget(
  widget: WidgetDef,
  dispatch: Dispatch<DashboardAction>,
  tileId: string,
): JSX.Element {
  const entry = widgetRegistry[widget.type];
  if (!entry) return <div>Unknown widget type: {widget.type}</div>;
  const update: WidgetUpdater = (patch) => {
    if (patch.title !== undefined || patch.config) {
      dispatch({ type: "UPDATE_WIDGET", widgetId: widget.id, patch });
    }
    if (patch.resize) {
      dispatch({ type: "RESIZE_TILE", tileId, size: patch.resize });
    }
  };
  return entry.render(widget.config, update);
}
