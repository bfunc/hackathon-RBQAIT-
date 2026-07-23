import type { Layout } from "react-grid-layout";
import type { DashboardState, TileNode, WidgetDef } from "../types";

export type DashboardAction =
  | { type: "SET_LAYOUT"; layout: Layout[] }
  | {
      type: "DROP_WIDGET";
      widget: WidgetDef;
      tile: TileNode;
      layoutItem: Layout;
    }
  | { type: "REORDER_TAB_WIDGETS"; tileId: string; widgetIds: string[] }
  | { type: "SET_ACTIVE_TAB"; tileId: string; widgetId: string }
  | { type: "REMOVE_TILE"; tileId: string }
  | {
      type: "UPDATE_WIDGET";
      widgetId: string;
      patch: { title?: string; config?: Record<string, unknown> };
    }
  | {
      type: "RESIZE_TILE";
      tileId: string;
      // Partial on purpose — e.g. relaxing minW once a result renders
      // shouldn't also force the tile back to a specific w/h.
      size: { w?: number; h?: number; minW?: number; minH?: number };
    }
  | {
      type: "SEED_WIDGETS";
      widgets: Record<string, WidgetDef>;
      tiles: Record<string, TileNode>;
      layout: Layout[];
    }
  | { type: "RESET_DASHBOARD" }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_SIDEBAR_WIDTH"; width: number };

// This reducer is the single owner of `layout`/`tiles`/`widgets` state.
// onLayoutChange, onDrop, and tab-reorder all route through here so they
// can never race each other writing to the same arrays.
export function dashboardReducer(
  state: DashboardState,
  action: DashboardAction,
): DashboardState {
  switch (action.type) {
    case "SET_LAYOUT": {
      return { ...state, layout: action.layout };
    }

    case "DROP_WIDGET": {
      const { widget, tile, layoutItem } = action;
      return {
        ...state,
        widgets: { ...state.widgets, [widget.id]: widget },
        tiles: { ...state.tiles, [tile.id]: tile },
        layout: [...state.layout, layoutItem],
      };
    }

    case "REORDER_TAB_WIDGETS": {
      const existing = state.tiles[action.tileId];
      if (!existing) return state;
      return {
        ...state,
        tiles: {
          ...state.tiles,
          [action.tileId]: { ...existing, widgetIds: action.widgetIds },
        },
      };
    }

    case "SET_ACTIVE_TAB": {
      const existing = state.tiles[action.tileId];
      if (!existing) return state;
      return {
        ...state,
        tiles: {
          ...state.tiles,
          [action.tileId]: { ...existing, activeTab: action.widgetId },
        },
      };
    }

    case "REMOVE_TILE": {
      const tile = state.tiles[action.tileId];
      if (!tile) return state;

      const remainingTiles = { ...state.tiles };
      delete remainingTiles[action.tileId];

      const remainingWidgets = { ...state.widgets };
      for (const widgetId of tile.widgetIds) delete remainingWidgets[widgetId];

      return {
        ...state,
        tiles: remainingTiles,
        widgets: remainingWidgets,
        layout: state.layout.filter((item) => item.i !== action.tileId),
      };
    }

    case "UPDATE_WIDGET": {
      const existing = state.widgets[action.widgetId];
      if (!existing) return state;
      return {
        ...state,
        widgets: {
          ...state.widgets,
          [action.widgetId]: {
            ...existing,
            ...(action.patch.title !== undefined ? { title: action.patch.title } : null),
            ...(action.patch.config
              ? { config: { ...existing.config, ...action.patch.config } }
              : null),
          },
        },
      };
    }

    case "RESIZE_TILE": {
      return {
        ...state,
        layout: state.layout.map((item) =>
          item.i === action.tileId ? { ...item, ...action.size } : item,
        ),
      };
    }

    case "SEED_WIDGETS": {
      return {
        ...state,
        widgets: { ...state.widgets, ...action.widgets },
        tiles: { ...state.tiles, ...action.tiles },
        layout: [...state.layout, ...action.layout],
      };
    }

    case "RESET_DASHBOARD": {
      return { ...state, widgets: {}, tiles: {}, layout: [] };
    }

    case "TOGGLE_SIDEBAR": {
      return {
        ...state,
        sidebar: { ...state.sidebar, collapsed: !state.sidebar.collapsed },
      };
    }

    case "SET_SIDEBAR_WIDTH": {
      return { ...state, sidebar: { ...state.sidebar, width: action.width } };
    }

    default:
      return state;
  }
}
