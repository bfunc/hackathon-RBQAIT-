import { useEffect } from "react";
import type { WidgetUpdater } from "../widgets/registry";
import type { BuilderConfig } from "./types";
import { BUILDER_DEFAULT_SIZE } from "./constants";
import { deriveDataset } from "./datasets";
import { PromptForm } from "./PromptForm";
import { LoadingState } from "./LoadingState";
import { GeneratedTable } from "./GeneratedTable";
import { GeneratedChart } from "./GeneratedChart";
import { GeneratedMetric } from "./GeneratedMetric";
import { GeneratedDonut } from "./GeneratedDonut";

const GENERATE_DELAY_MS = 720;

export function BuilderWidget({
  config,
  update,
}: {
  config: Record<string, unknown>;
  update: WidgetUpdater;
}) {
  const { mode = "prompt", prompt = "", widgetType = "auto" } = config as BuilderConfig;

  useEffect(() => {
    if (mode !== "loading") return;
    const timer = setTimeout(() => {
      const dataset = deriveDataset(prompt, widgetType);
      update({
        title: dataset.title,
        config: { mode: "result", category: dataset.category },
        // The prompt form needs a wide floor so its Widget Type row doesn't
        // wrap; a rendered result doesn't, so relax it back down once
        // generation completes, letting the tile be resized freely.
        resize: { minW: 2 },
      });
    }, GENERATE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [mode, prompt, widgetType, update]);

  function handleEdit() {
    update({ title: "AI Builder", config: { mode: "prompt" }, resize: BUILDER_DEFAULT_SIZE });
  }

  if (mode === "prompt") {
    return (
      <PromptForm
        initialPrompt={prompt}
        initialWidgetType={widgetType}
        onSubmit={(text, type) =>
          update({ config: { mode: "loading", prompt: text, widgetType: type } })
        }
      />
    );
  }

  if (mode === "loading") {
    return <LoadingState />;
  }

  const dataset = deriveDataset(prompt, widgetType);
  switch (dataset.kind) {
    case "grid":
      return <GeneratedTable dataset={dataset} prompt={prompt} onEdit={handleEdit} />;
    case "graph":
      return <GeneratedChart dataset={dataset} prompt={prompt} onEdit={handleEdit} />;
    case "metric":
      return <GeneratedMetric dataset={dataset} prompt={prompt} onEdit={handleEdit} />;
    case "donut":
      return <GeneratedDonut dataset={dataset} prompt={prompt} onEdit={handleEdit} />;
  }
}
