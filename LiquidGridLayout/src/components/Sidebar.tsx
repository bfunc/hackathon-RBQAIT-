import { useRef, useState } from "react";
import { widgetRegistry } from "../widgets/registry";
import { dragState } from "../widgets/dragState";
import { useDashboardDispatch, useDashboardState } from "../state/DashboardContext";
import { ChevronIcon, GripIcon, PanelToggleIcon } from "./ToolbarIcon";
import { SparkleIcon } from "../builder/components/icons";
import { StackIcon, ZapIcon } from "./sidebarIcons";
import { CreativeDemosTab } from "./CreativeDemosTab";
import { CREATIVE_DEMO_IDEAS } from "./creativeDemoIdeas";

const POPULAR_PROMPTS = CREATIVE_DEMO_IDEAS.slice(0, 4);

export const WIDGET_TYPE_DATA_FORMAT = "application/x-widget-type";

type SidebarTab = "ai-builder" | "creative-demos" | "library";

const TABS: { id: SidebarTab; label: string; icon: (props: { size?: number }) => JSX.Element }[] = [
  { id: "ai-builder", label: "AI Builder", icon: SparkleIcon },
  { id: "creative-demos", label: "Creative Demos", icon: ZapIcon },
  { id: "library", label: "Library", icon: StackIcon },
];

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 480;

export function Sidebar() {
  const { sidebar } = useDashboardState();
  const dispatch = useDashboardDispatch();
  const entries = Object.values(widgetRegistry);
  const [activeTab, setActiveTab] = useState<SidebarTab>("ai-builder");
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  function onResizeMouseMove(e: MouseEvent) {
    if (!dragRef.current) return;
    const delta = e.clientX - dragRef.current.startX;
    const next = Math.min(
      MAX_SIDEBAR_WIDTH,
      Math.max(MIN_SIDEBAR_WIDTH, dragRef.current.startWidth + delta),
    );
    dispatch({ type: "SET_SIDEBAR_WIDTH", width: next });
  }

  function onResizeMouseUp() {
    dragRef.current = null;
    setIsResizing(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    document.removeEventListener("mousemove", onResizeMouseMove);
    document.removeEventListener("mouseup", onResizeMouseUp);
  }

  function onResizeMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startWidth: sidebar.width };
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onResizeMouseMove);
    document.addEventListener("mouseup", onResizeMouseUp);
  }

  function onPaletteDragStart(e: React.DragEvent, type: string) {
    // Stash the widget type on the native DataTransfer so onDrop can read
    // it even though this is a fresh drop target, not component state.
    e.dataTransfer.setData(WIDGET_TYPE_DATA_FORMAT, type);
    e.dataTransfer.effectAllowed = "copy";
    // Also mirror it in dragState — onDropDragOver needs the type to size
    // the drop preview, and dataTransfer.getData isn't reliable pre-drop.
    dragState.type = type;
  }

  function onPaletteDragEnd() {
    dragState.type = null;
  }

  return (
    <aside
      className={`sidebar ${sidebar.collapsed ? "sidebar-collapsed" : ""} ${isResizing ? "sidebar-resizing" : ""}`}
      style={{ width: sidebar.collapsed ? 56 : sidebar.width }}
    >
      <button
        className={`sidebar-toggle ${sidebar.collapsed ? "sidebar-toggle-collapsed" : ""}`}
        aria-label={sidebar.collapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
      >
        <span className={`sidebar-toggle-icon-box ${sidebar.collapsed ? "sidebar-toggle-icon-mirrored" : ""}`}>
          <PanelToggleIcon />
        </span>
        {!sidebar.collapsed && (
          <span className="sidebar-toggle-label">Palette ({entries.length})</span>
        )}
      </button>

      {sidebar.collapsed ? (
        <ul className="palette-rail">
          {entries.map((entry) => (
            <li
              key={entry.type}
              className="palette-rail-item"
              draggable="true"
              onDragStart={(e) => onPaletteDragStart(e, entry.type)}
              onDragEnd={onPaletteDragEnd}
              title={entry.title}
            >
              <SparkleIcon size={16} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="sidebar-content">
          {/* Only "AI Builder" has real content; "Library" is a static
              placeholder — "Creative Demos" is now fully wired. */}
          <div className="sidebar-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`sidebar-tab ${activeTab === tab.id ? "sidebar-tab-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "ai-builder" && (
            <>
              <h3 className="sidebar-heading">Widget Palette</h3>
              <ul className="palette-list">
                {entries.map((entry) => (
                  <li
                    key={entry.type}
                    className={`palette-item ${entry.type === "builder" ? "palette-item-featured" : ""}`}
                    draggable="true"
                    onDragStart={(e) => onPaletteDragStart(e, entry.type)}
                    onDragEnd={onPaletteDragEnd}
                  >
                    <span className="palette-item-icon">
                      <SparkleIcon size={16} />
                    </span>
                    <span className="palette-item-label">{entry.title}</span>
                    <span className="palette-item-grip">
                      <GripIcon />
                    </span>
                  </li>
                ))}
              </ul>

              {/* Static dummy — matches the reference's "Popular Financial
                  Prompts" quick-start list; not wired to real generation. */}
              <div className="sidebar-popular-prompts">
                <h3 className="sidebar-heading">Popular Financial Prompts</h3>
                <div className="sidebar-popular-prompt-list">
                  {POPULAR_PROMPTS.map((idea) => (
                    <div key={idea.id} className="sidebar-popular-prompt-row">
                      <span className="sidebar-popular-prompt-icon">
                        <idea.icon />
                      </span>
                      <span className="sidebar-popular-prompt-text">
                        <span className="sidebar-popular-prompt-title">{idea.title}</span>
                        <span className="sidebar-popular-prompt-description">{idea.description}</span>
                      </span>
                      <span className="sidebar-popular-prompt-chevron">
                        <ChevronIcon />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "creative-demos" && <CreativeDemosTab />}

          {activeTab === "library" && <p className="sidebar-placeholder">Library is coming soon.</p>}
        </div>
      )}

      {!sidebar.collapsed && (
        <div
          className="sidebar-resize-handle"
          onMouseDown={onResizeMouseDown}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
        />
      )}
    </aside>
  );
}
