Design the visual system for a configurable widget dashboard app. The functional structure is fixed (built separately) — you're skinning it, not restructuring it. Components you need to design:

1. Collapsible sidebar
   - Contains a "widget palette": a list/grid of draggable widget templates (icon + label), grouped/categorized
   - Needs a clear collapsed state (icon rail) and expanded state, with a smooth transition
   - Needs a visible, comfortable drag affordance on each palette item (this gets picked up and dragged onto the grid)

2. Grid tiles (cards sitting inside a drag/resize grid)
   - Each tile needs: a header/chrome area with a title, a dedicated drag-handle (small icon/region — dragging the tile must NOT happen from clicking anywhere on the tile body), a resize handle (typically bottom-right corner), and a close/remove action
   - Needs a distinct hover/active state, and a "being dragged" ghost/placeholder style (semi-transparent or outlined preview) since the grid library shows a live placeholder while dragging/resizing
   - Support empty/loading/error states for widget content

3. Tab-group tiles (a tile that contains multiple widgets as tabs)
   - Tab strip sits in the tile header area, horizontally scrollable if many tabs
   - Active tab needs strong visual distinction; tabs must be visually draggable/reorderable (drag handle can be the tab itself, subtle grab cursor)
   - Needs to look visually distinct from a single-widget tile at a glance, but still consistent with the overall tile chrome

4. Drop target feedback
   - Style for the grid's "placeholder" cell shown while dragging a palette widget over the grid (dashed outline / tinted fill, matching whatever visual language the tile cards use)
   - Should clearly communicate "a widget will land here" without looking like a permanent tile

5. General
   - Dense, data-heavy dashboard aesthetic — assume widgets show charts, tables, KPI numbers
   - Needs both a light and dark theme
   - Define a small design token set: spacing scale, tile corner radius, shadow/elevation for dragged vs. resting tiles, color for active/selected/hover states
   - Typography scale that stays legible at small tile sizes (tiles can be resized very small)

Deliverable: component-level visual specs (states, spacing, colors) that can be mapped directly onto the existing DOM structure — sidebar / grid-area / tile / tab-strip / palette-item — without requiring structural changes.