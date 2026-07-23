import type { Layout } from "react-grid-layout";

export interface WidgetDef {
  id: string;
  type: string;
  title: string;
  config: Record<string, unknown>;
}

export interface TileNode {
  id: string;
  kind: "single" | "tabGroup";
  widgetIds: string[];
  activeTab?: string;
}

export interface DashboardState {
  widgets: Record<string, WidgetDef>;
  tiles: Record<string, TileNode>;
  layout: Layout[];
  sidebar: {
    collapsed: boolean;
    width: number;
  };
}
