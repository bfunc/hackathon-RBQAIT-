import { useState } from "react";
import { createPortal } from "react-dom";
import type { TileNode } from "../types";
import { useDashboardDispatch, useDashboardState } from "../state/DashboardContext";
import { renderWidget } from "../widgets/registry";
import {
  CloseIcon,
  CollapseIcon,
  DownloadIcon,
  ExpandIcon,
  ExportIcon,
  GripIcon,
  ToolbarIcon,
} from "./ToolbarIcon";

export function SingleTile({ tile }: { tile: TileNode }) {
  const state = useDashboardState();
  const dispatch = useDashboardDispatch();
  const widget = state.widgets[tile.widgetIds[0]];
  const [maximized, setMaximized] = useState(false);
  const category = widget?.config?.category as string | undefined;

  const body = (
    <div className={`tile single-tile ${maximized ? "tile-maximized" : ""}`}>
      <div className="tile-header">
        <span className="tile-drag-handle" title="Drag to move">
          <GripIcon />
        </span>
        <span className="tile-title-group">
          <span className="tile-title">{widget?.title ?? "Widget"}</span>
          {category && <span className="tile-category-badge">{category}</span>}
        </span>
        <span className="tile-toolbar">
          <ToolbarIcon label="Export" onClick={() => {}}>
            <ExportIcon />
          </ToolbarIcon>
          <ToolbarIcon label="Download underlying data" onClick={() => {}}>
            <DownloadIcon />
          </ToolbarIcon>
          <ToolbarIcon
            label={maximized ? "Restore tile" : "Expand tile"}
            onClick={() => setMaximized((v) => !v)}
          >
            {maximized ? <CollapseIcon /> : <ExpandIcon />}
          </ToolbarIcon>
          <ToolbarIcon label="Remove tile" onClick={() => dispatch({ type: "REMOVE_TILE", tileId: tile.id })}>
            <CloseIcon />
          </ToolbarIcon>
        </span>
      </div>
      <div className="tile-content">{widget ? renderWidget(widget, dispatch, tile.id) : null}</div>
    </div>
  );

  if (maximized) {
    return createPortal(<div className="tile-maximize-overlay">{body}</div>, document.body);
  }
  return body;
}
