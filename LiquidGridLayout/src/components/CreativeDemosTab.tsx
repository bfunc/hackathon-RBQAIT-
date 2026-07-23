import { useMemo, useState } from "react";
import { useDashboardDispatch } from "../state/DashboardContext";
import { buildSingleSeedLayoutItem } from "../state/demoSeeds";
import { deriveDataset } from "../builder/datasets";
import { nextId } from "../widgets/idGenerator";
import type { TileNode, WidgetDef } from "../types";
import { CREATIVE_DEMO_IDEAS, DEMO_CATEGORIES, type DemoCategory } from "./creativeDemoIdeas";
import { SearchIcon } from "./sidebarIcons";
import { SparkleIcon } from "../builder/components/icons";

export function CreativeDemosTab() {
  const dispatch = useDashboardDispatch();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<DemoCategory | "All">("All");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return CREATIVE_DEMO_IDEAS.filter((idea) => {
      const matchesCategory = category === "All" || idea.category === category;
      const matchesSearch =
        !query || idea.title.toLowerCase().includes(query) || idea.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  function handleRunAndAdd(idea: (typeof CREATIVE_DEMO_IDEAS)[number]) {
    const dataset = deriveDataset(idea.prompt, idea.widgetType);
    const widget: WidgetDef = {
      id: nextId("widget"),
      type: "builder",
      title: dataset.title,
      config: {
        mode: "result",
        prompt: idea.prompt,
        widgetType: idea.widgetType,
        category: dataset.category,
      },
    };
    const tile: TileNode = { id: nextId("tile"), kind: "single", widgetIds: [widget.id] };
    const layoutItem = buildSingleSeedLayoutItem(tile.id, 4, 9);

    dispatch({ type: "DROP_WIDGET", widget, tile, layoutItem });
  }

  return (
    <div className="creative-demos">
      <div className="creative-demos-search">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search demo prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="creative-demos-categories">
        <button
          type="button"
          className={`creative-demos-chip ${category === "All" ? "creative-demos-chip-active" : ""}`}
          onClick={() => setCategory("All")}
        >
          All
        </button>
        {DEMO_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`creative-demos-chip ${category === cat ? "creative-demos-chip-active" : ""}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="creative-demos-list">
        {filtered.map((idea) => (
          <div key={idea.id} className="creative-demo-card">
            <div className="creative-demo-card-header">
              <span className="creative-demo-card-icon">
                <idea.icon />
              </span>
              <span className="creative-demo-card-title">{idea.title}</span>
              <span className="creative-demo-card-badge">{idea.badge}</span>
            </div>
            <p className="creative-demo-card-description">{idea.description}</p>
            <div className="creative-demo-card-footer">
              <span className="creative-demo-card-label">Prompt Template</span>
              <button
                type="button"
                className="creative-demo-run-button"
                onClick={() => handleRunAndAdd(idea)}
              >
                <SparkleIcon size={14} />
                Run &amp; Add
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="creative-demos-empty">No demo prompts match.</p>}
      </div>
    </div>
  );
}
