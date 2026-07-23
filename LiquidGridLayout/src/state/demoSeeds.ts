import type { Layout } from "react-grid-layout";
import type { TileNode, WidgetDef } from "../types";
import type { WidgetTypeChoice } from "../builder/types";
import { deriveDataset } from "../builder/datasets";
import { nextId } from "../widgets/idGenerator";

export interface SeedSpec {
  prompt: string;
  widgetType: WidgetTypeChoice;
  layout: { x: number; y: number; w: number; h: number };
}

// Fixed demo layouts — hand-picked (not randomized) so each seed always
// reproduces the same known-good demo page.

export const GENERAL_DEMO_SEED: SeedSpec[] = [
  { prompt: "Show active user growth", widgetType: "chart", layout: { x: 0, y: 0, w: 3, h: 5 } },
  { prompt: "Show recent transactions", widgetType: "grid", layout: { x: 3, y: 0, w: 6, h: 8 } },
  { prompt: "Show recent transactions", widgetType: "metric", layout: { x: 0, y: 16, w: 3, h: 5 } },
  { prompt: "saxasxsaxa", widgetType: "grid", layout: { x: 0, y: 5, w: 3, h: 11 } },
  { prompt: "cdscsdcs", widgetType: "grid", layout: { x: 3, y: 8, w: 6, h: 13 } },
  { prompt: "cc", widgetType: "metric", layout: { x: 9, y: 0, w: 2, h: 6 } },
  { prompt: "c", widgetType: "chart", layout: { x: 9, y: 6, w: 2, h: 6 } },
  { prompt: "dcsdc", widgetType: "chart", layout: { x: 9, y: 12, w: 2, h: 9 } },
];

export const TRADING_DESK_SEED: SeedSpec[] = [
  { prompt: "Show recent client deals", widgetType: "grid", layout: { x: 0, y: 0, w: 6, h: 9 } },
  { prompt: "Show active clients", widgetType: "chart", layout: { x: 6, y: 0, w: 3, h: 9 } },
  { prompt: "Show realized gain", widgetType: "metric", layout: { x: 9, y: 0, w: 3, h: 5 } },
  { prompt: "Show recent client deals", widgetType: "grid", layout: { x: 0, y: 9, w: 3, h: 9 } },
  { prompt: "Show realized gain", widgetType: "metric", layout: { x: 9, y: 5, w: 2, h: 7 } },
  { prompt: "Show book allocation by asset class", widgetType: "donut", layout: { x: 6, y: 9, w: 3, h: 9 } },
  { prompt: "ccc", widgetType: "grid", layout: { x: 3, y: 9, w: 3, h: 9 } },
  { prompt: "v", widgetType: "metric", layout: { x: 0, y: 18, w: 2, h: 6 } },
  { prompt: "ccc", widgetType: "chart", layout: { x: 9, y: 12, w: 2, h: 6 } },
];

export function buildSeedState(seeds: SeedSpec[]): {
  widgets: Record<string, WidgetDef>;
  tiles: Record<string, TileNode>;
  layout: Layout[];
} {
  const widgets: Record<string, WidgetDef> = {};
  const tiles: Record<string, TileNode> = {};
  const layout: Layout[] = [];

  seeds.forEach((seed) => {
    const dataset = deriveDataset(seed.prompt, seed.widgetType);

    const widget: WidgetDef = {
      id: nextId("widget"),
      type: "builder",
      title: dataset.title,
      config: {
        mode: "result",
        prompt: seed.prompt,
        widgetType: seed.widgetType,
        category: dataset.category,
      },
    };
    const tile: TileNode = { id: nextId("tile"), kind: "single", widgetIds: [widget.id] };

    widgets[widget.id] = widget;
    tiles[tile.id] = tile;
    layout.push({ i: tile.id, ...seed.layout });
  });

  return { widgets, tiles, layout };
}

/** Adds one widget at the bottom of the current layout (auto-stacked). */
export function buildSingleSeedLayoutItem(tileId: string, w: number, h: number): Layout {
  return { i: tileId, x: 0, y: Infinity, w, h };
}
