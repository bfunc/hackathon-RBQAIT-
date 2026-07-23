import GridLayout, { type Layout } from "react-grid-layout";
import { useContainerWidth } from "../hooks/useContainerWidth";
import { useDashboardDispatch, useDashboardState } from "../state/DashboardContext";
import { widgetRegistry, type GridSize } from "../widgets/registry";
import { dragState } from "../widgets/dragState";
import { nextId } from "../widgets/idGenerator";
import { WIDGET_TYPE_DATA_FORMAT } from "./Sidebar";
import { SingleTile } from "./SingleTile";
import { TabbedTile } from "./TabbedTile";
import type { TileNode, WidgetDef } from "../types";

const DROPPING_ITEM = { i: "__dropping-elem__", w: 4, h: 4 };

export function GridArea() {
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const state = useDashboardState();
  const dispatch = useDashboardDispatch();

  function handleLayoutChange(layout: Layout[]) {
    // Only fires from RGL-driven drag/resize/reflow; onDrop below appends
    // via the same reducer so `layout` never gets written from two places
    // independently.
    dispatch({ type: "SET_LAYOUT", layout });
  }

  // Sizes the live drop-preview per widget type (e.g. the AI builder needs
  // more room than a text widget) — dataTransfer isn't reliably readable
  // during dragover, so this reads the type dragState.type mirrors instead.
  function handleDropDragOver(): GridSize | undefined {
    const type = dragState.type;
    return type ? widgetRegistry[type]?.defaultSize : undefined;
  }

  function handleDrop(_layout: Layout[], item: Layout, e: DragEvent) {
    const widgetType = e.dataTransfer?.getData(WIDGET_TYPE_DATA_FORMAT);
    if (!widgetType || !widgetRegistry[widgetType]) return;

    const entry = widgetRegistry[widgetType];
    const widgetId = nextId("widget");
    const tileId = nextId("tile");

    const widget: WidgetDef = {
      id: widgetId,
      type: widgetType,
      title: entry.title,
      config: { ...entry.defaultConfig },
    };

    const tile: TileNode = {
      id: tileId,
      kind: "single",
      widgetIds: [widgetId],
    };

    const layoutItem: Layout = {
      ...item,
      i: tileId,
    };

    dispatch({ type: "DROP_WIDGET", widget, tile, layoutItem });
  }

  return (
    <div className="grid-area" ref={ref}>
      {width > 0 && (
        <GridLayout
          className="grid-layout"
          style={{ minHeight: "100%" }}
          layout={state.layout}
          cols={12}
          rowHeight={30}
          width={width}
          draggableHandle=".tile-drag-handle"
          isDroppable
          droppingItem={DROPPING_ITEM}
          onDropDragOver={handleDropDragOver}
          onLayoutChange={handleLayoutChange}
          onDrop={handleDrop}
        >
          {state.layout.map((layoutItem) => {
            const tile = state.tiles[layoutItem.i];
            if (!tile) return null;
            return (
              <div key={tile.id}>
                {tile.kind === "tabGroup" ? (
                  <TabbedTile tile={tile} />
                ) : (
                  <SingleTile tile={tile} />
                )}
              </div>
            );
          })}
        </GridLayout>
      )}
    </div>
  );
}
