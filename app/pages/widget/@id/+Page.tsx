import { useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { trpc } from "../../../trpc/client";
import { DataGrid } from "../../../components/DataGrid";
import type { Widget } from "../../../database/kysely/types";

type WidgetData =
  | { widget: Widget; columns: string[]; rows: unknown[][] }
  | { widget: Widget; error: string };

export default function Page() {
  const { routeParams } = usePageContext();
  const id = Number(routeParams.id);
  const [data, setData] = useState<WidgetData | null>(null);

  useEffect(() => {
    setData(null);
    void trpc.getWidgetData.query({ id }).then(setData);
  }, [id]);

  return (
    <>
      <p>
        <a href="/demo">← Back to demo</a>
      </p>
      <h1 style={{ fontSize: "1.9em" }}>{data?.widget.name ?? "Loading…"}</h1>
      {!data && <p style={{ color: "var(--text-muted)" }}>Loading…</p>}
      {data && "error" in data && (
        <p style={{ color: "var(--accent-red)" }}>widget broken — regenerate: {data.error}</p>
      )}
      {data && "columns" in data && <DataGrid columns={data.columns} rows={data.rows} />}
    </>
  );
}
