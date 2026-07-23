import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { TileNode } from "../types";
import { useDashboardDispatch, useDashboardState } from "../state/DashboardContext";
import { renderWidget } from "../widgets/registry";
import { SortableTab } from "./SortableTab";
import {
  ChevronIcon,
  CloseIcon,
  CollapseIcon,
  DownloadIcon,
  ExpandIcon,
  ExportIcon,
  GripIcon,
  ToolbarIcon,
} from "./ToolbarIcon";

export function TabbedTile({ tile }: { tile: TileNode }) {
  const state = useDashboardState();
  const dispatch = useDashboardDispatch();
  const stripRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [maximized, setMaximized] = useState(false);

  const activeTabId = tile.activeTab ?? tile.widgetIds[0];
  const activeWidget = state.widgets[activeTabId];

  // dnd-kit's pointer sensor drives the tab strip only; RGL's tile drag is
  // scoped to .tile-drag-handle via draggableHandle, so these two pointer
  // systems never see the same events.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function updateScrollAffordances() {
    const el = stripRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }

  useEffect(() => {
    updateScrollAffordances();
    const el = stripRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateScrollAffordances);
    observer.observe(el);
    return () => observer.disconnect();
  }, [tile.widgetIds.length]);

  function scrollBy(amount: number) {
    stripRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tile.widgetIds.indexOf(String(active.id));
    const newIndex = tile.widgetIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(tile.widgetIds, oldIndex, newIndex);
    // Tab reorder writes back to TileNode.widgetIds only; grid/layout state
    // is untouched by this drag.
    dispatch({ type: "REORDER_TAB_WIDGETS", tileId: tile.id, widgetIds: reordered });
  }

  const body = (
    <div className={`tile tabbed-tile ${maximized ? "tile-maximized" : ""}`}>
      <div className="tile-header tabbed-tile-header">
        <span className="tile-drag-handle" title="Drag to move">
          <GripIcon />
        </span>

        {canScrollLeft && (
          <button
            type="button"
            className="tab-scroll-button tab-scroll-left"
            aria-label="Scroll tabs left"
            onClick={() => scrollBy(-120)}
          >
            <span className="chevron-left">
              <ChevronIcon />
            </span>
          </button>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tile.widgetIds} strategy={horizontalListSortingStrategy}>
            <div className="tab-strip" ref={stripRef} onScroll={updateScrollAffordances}>
              {tile.widgetIds.map((widgetId) => {
                const widget = state.widgets[widgetId];
                return (
                  <SortableTab
                    key={widgetId}
                    id={widgetId}
                    label={widget?.title ?? widgetId}
                    active={widgetId === activeTabId}
                    onSelect={() =>
                      dispatch({ type: "SET_ACTIVE_TAB", tileId: tile.id, widgetId })
                    }
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        {canScrollRight && (
          <button
            type="button"
            className="tab-scroll-button tab-scroll-right"
            aria-label="Scroll tabs right"
            onClick={() => scrollBy(120)}
          >
            <ChevronIcon />
          </button>
        )}

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
      <div className="tile-content">{activeWidget ? renderWidget(activeWidget, dispatch, tile.id) : null}</div>
    </div>
  );

  if (maximized) {
    return createPortal(<div className="tile-maximize-overlay">{body}</div>, document.body);
  }
  return body;
}
