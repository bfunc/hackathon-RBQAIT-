Build a configurable widget dashboard in React using:

- react-grid-layout (RGL) for the tile grid (drag/resize/reflow)
- dnd-kit for reordering tabs within a tab-group tile (sortable, horizontal)
- RGL's native isDroppable/droppingItem/onDrop for dragging widgets from a palette sidebar onto the grid (NOT dnd-kit, NOT react-dnd, for this interaction)

DATA MODEL:

- WidgetDef { id, type, title, config } — type maps to a component in a WidgetRegistry
- TileNode { id, kind: 'single' | 'tabGroup', widgetIds: string[], activeTab? } — RGL only ever knows about TileNode ids, never individual widgets
- DashboardState { widgets: Record<id, WidgetDef>, tiles: Record<id, TileNode>, layout: Layout[] (RGL's native array, keyed by TileNode.id), sidebar: { collapsed, width } }

COMPONENT TREE:

- DashboardShell
  - Sidebar: collapsible/extendable, hosts a widget palette (list of draggable WidgetDef templates, native HTML5 draggable="true")
  - GridArea: measures its own width via ResizeObserver (do NOT rely on RGL's default WidthProvider window-resize listener alone, since sidebar collapse changes container width without a window resize — build a small custom width provider using ResizeObserver on the grid container)
    - ResponsiveGridLayout (isDroppable=true, droppingItem={fallback w/h}, onDrop handler)
      - one grid item per TileNode.id
        - if kind === 'tabGroup': TabbedTile (renders tab strip wrapped in dnd-kit SortableContext, items=widgetIds, horizontalListSortingStrategy; each tab is useSortable; onDragEnd does arrayMove and writes back to TileNode.widgetIds only — no grid/layout state touched by this drag)
        - if kind === 'single': SingleTile wrapping the widget

RULES / CONSTRAINTS:

- RGL's own tile drag must be scoped to a dedicated drag-handle element via draggableHandle prop — do not let RGL listen on the whole tile, or it will conflict with the tab strip's dnd-kit pointer listeners.
- Widget components are dumb: render(config) only. No awareness of grid, tiles, or tabs.
- Palette → grid drop: on dragstart from a palette item, stash the widget type/id (via e.dataTransfer.setData, not just component state) so onDrop can read it and construct a new WidgetDef + TileNode + layout entry.
- Tab reorder and RGL tile drag/resize are two separate, non-conflicting event systems (dnd-kit pointer events vs. react-draggable mousedown events) as long as the draggableHandle scoping rule above is respected.
- Layout array (RGL's `layout` prop) has exactly one owner/reducer — do not let onLayoutChange (RGL) and onDrop (RGL) and any future drag handlers write to it independently without going through the same state update path, to avoid races.
- Do not implement tab drag-out-to-new-tile or cross-tile tab drag yet — reorder-within-tab-group only, for now.
- Persistence: stub only, don't wire up yet — leave a clear serialization boundary (DashboardState should be trivially JSON-serializable) for a persistence layer to be added later.

Build this as a working skeleton with placeholder styling — the goal is correct interaction behavior (drag, resize, reflow, palette drop, tab reorder, sidebar collapse) first. Do not focus on visual design.
