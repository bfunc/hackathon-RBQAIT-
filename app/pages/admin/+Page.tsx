import { useEffect, useState } from "react";
import { trpc } from "../../trpc/client";
import { DataGrid } from "../../components/DataGrid";
import type { Widget } from "../../database/kysely/types";
import type { SchemaInfo } from "../../shared";

const CONNECTORS = [{ id: "connector1", label: "connector1" }];

type PreviewResult = { sql: string; columns: string[]; rows: unknown[][] };

export default function Page() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [sqlWidget, setSqlWidget] = useState<Widget | null>(null);

  async function refresh() {
    setWidgets(await trpc.listWidgets.query());
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleClone(id: number) {
    await trpc.cloneWidget.mutate({ id });
    await refresh();
  }

  async function handleToggleDemo(widget: Widget) {
    await trpc.setWidgetDemo.mutate({ id: widget.id, onDemo: widget.on_demo === 0 });
    await refresh();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this widget?")) return;
    await trpc.deleteWidget.mutate({ id });
    await refresh();
  }

  return (
    <>
      <h1 style={{ fontSize: "1.9em", marginBottom: 4 }}>Widgets</h1>
      <p style={{ color: "var(--text-muted)", marginTop: 0, marginBottom: 20 }}>
        Widgets the AI has generated. Curate which ones appear on the demo.
      </p>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Prompt</th>
              <th>Created</th>
              <th>Status</th>
              <th>SQL</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {widgets.map((widget) => (
              <tr key={widget.id}>
                <td style={{ fontWeight: 500 }}>{widget.name}</td>
                <td style={{ color: "var(--text-muted)" }}>{widget.prompt}</td>
                <td className="mono" style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {widget.created_at}
                </td>
                <td>
                  <span className={`badge ${widget.on_demo !== 0 ? "badge-on" : ""}`}>
                    {widget.on_demo === 0 ? "off demo" : "on demo"}
                  </span>
                </td>
                <td>
                  <button type="button" className="btn btn-ghost" onClick={() => setSqlWidget(widget)}>
                    View SQL
                  </button>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button type="button" className="btn btn-ghost" onClick={() => handleClone(widget.id)}>
                      Clone
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => handleToggleDemo(widget)}>
                      {widget.on_demo === 0 ? "Add to demo" : "Remove from demo"}
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => handleDelete(widget.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sqlWidget && <SqlModal widget={sqlWidget} onClose={() => setSqlWidget(null)} />}

      <p style={{ marginTop: 20 }}>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ New widget"}
        </button>
      </p>

      {showForm && <NewWidgetForm onSaved={refresh} onCancel={() => setShowForm(false)} />}
    </>
  );
}

function NewWidgetForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [connectorId, setConnectorId] = useState(CONNECTORS[0]!.id);
  const [name, setName] = useState("");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [schema, setSchema] = useState<SchemaInfo | null>(null);

  useEffect(() => {
    setSchema(null);
    void trpc.getConnectorSchema.query({ connectorId }).then(setSchema);
  }, [connectorId]);

  async function handleGenerate() {
    setError(null);
    setBusy(true);
    try {
      const result = await trpc.generateWidget.mutate({ prompt, connectorId });
      setPreview(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPreview(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    if (!preview) return;
    setError(null);
    setBusy(true);
    try {
      await trpc.saveWidget.mutate({ name, prompt, connectorId, sql: preview.sql });
      onSaved();
      onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 14 }}>
        <label
          htmlFor="widget-prompt"
          style={{ display: "block", fontSize: "0.85em", color: "var(--text-muted)", marginBottom: 6 }}
        >
          Prompt
        </label>
        <textarea
          id="widget-prompt"
          className="field"
          style={{ width: "100%" }}
          value={prompt}
          onChange={(ev) => setPrompt(ev.target.value)}
          rows={3}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label
          htmlFor="widget-connector"
          style={{ display: "block", fontSize: "0.85em", color: "var(--text-muted)", marginBottom: 6 }}
        >
          Connector
        </label>
        <select
          id="widget-connector"
          className="field"
          value={connectorId}
          onChange={(ev) => setConnectorId(ev.target.value)}
        >
          {CONNECTORS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {schema && (
        <div className="mono" style={{ fontSize: "0.82em", color: "var(--text-muted)", marginBottom: 14 }}>
          {schema.tables.map((table) => (
            <div key={table.name} style={{ marginBottom: 2 }}>
              <span style={{ color: "var(--text)", fontWeight: 600 }}>{table.name}</span>{" "}
              {table.columns.map((c, i) => (
                <span key={c.name}>
                  {i > 0 && ", "}
                  {c.name} <em style={{ color: "var(--accent-gold)" }}>{c.type}</em>
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      <button type="button" className="btn btn-primary" disabled={busy || !prompt} onClick={handleGenerate}>
        Generate
      </button>

      {error && <p style={{ color: "var(--accent-red)" }}>{error}</p>}

      {preview && (
        <>
          <div className="terminal" style={{ marginTop: 18 }}>
            <div className="terminal-titlebar">
              <span className="terminal-dot red" />
              <span className="terminal-dot yellow" />
              <span className="terminal-dot green" />
              <span className="terminal-label">generated_query.sql</span>
            </div>
            <pre>{preview.sql}</pre>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0" }}>
            <input
              type="text"
              className="field"
              placeholder="Name this widget"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
            />
            <button type="button" className="btn btn-primary" disabled={busy || !name} onClick={handleSave}>
              Submit
            </button>
          </div>

          <DataGrid columns={preview.columns} rows={preview.rows} />
        </>
      )}
    </div>
  );
}

function SqlModal({ widget, onClose }: { widget: Widget; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(4, 6, 10, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
    >
      <div
        onClick={(ev) => ev.stopPropagation()}
        className="terminal"
        style={{ maxWidth: "80%", maxHeight: "80%", overflow: "auto" }}
      >
        <div className="terminal-titlebar">
          <span className="terminal-dot red" />
          <span className="terminal-dot yellow" />
          <span className="terminal-dot green" />
          <span className="terminal-label">{widget.name}.sql</span>
        </div>
        <pre>{widget.sql}</pre>
        <div style={{ padding: "0 16px 16px" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
