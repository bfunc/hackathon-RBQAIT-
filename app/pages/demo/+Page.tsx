import { useEffect, useState } from "react";
import { trpc } from "../../trpc/client";
import type { Widget } from "../../database/kysely/types";

export default function Page() {
  const [widgets, setWidgets] = useState<Widget[]>([]);

  useEffect(() => {
    void trpc.listDemoWidgets.query().then(setWidgets);
  }, []);

  return (
    <>
      <h1 style={{ fontSize: "1.9em", marginBottom: 20 }}>Demo</h1>
      <div className="card" style={{ padding: 0 }}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {widgets.map((widget, i) => (
            <li
              key={widget.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                borderBottom: i < widgets.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <span style={{ fontWeight: 500 }}>{widget.name}</span>
              <a href={`/widget/${widget.id}`}>
                <button type="button" className="btn btn-primary">
                  Open
                </button>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
