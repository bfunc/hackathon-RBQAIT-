import { useEffect, useState } from "react";
import { trpc } from "../../trpc/client";
import { DataGrid } from "../../components/DataGrid";
import type { Widget } from "../../database/kysely/types";

export default function Page() {
  const [widgets, setWidgets] = useState<Widget[]>([]);

  useEffect(() => {
    void trpc.listDemoWidgets.query().then(setWidgets);
  }, []);

  return (
    <>
      <h1>Demo</h1>
      {widgets.map((widget) => (
        <WidgetCard key={widget.id} widget={widget} />
      ))}
    </>
  );
}

type WidgetData =
  | { widget: Widget; columns: string[]; rows: unknown[][] }
  | { widget: Widget; error: string };

function WidgetCard({ widget }: { widget: Widget }) {
  const [data, setData] = useState<WidgetData | null>(null);

  useEffect(() => {
    void trpc.getWidgetData.query({ id: widget.id }).then(setData);
  }, [widget.id]);

  return (
    <section style={{ marginBottom: 32 }}>
      <h2>{widget.name}</h2>
      {!data && <p>Loading…</p>}
      {data && "error" in data && <p style={{ color: "red" }}>widget broken — regenerate: {data.error}</p>}
      {data && "columns" in data && <DataGrid columns={data.columns} rows={data.rows} />}
    </section>
  );
}
