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

  return (
    <>
      <h1>Widgets</h1>
      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Prompt</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {widgets.map((widget) => (
            <tr key={widget.id}>
              <td>{widget.name}</td>
              <td>{widget.prompt}</td>
              <td>{widget.created_at}</td>
              <td>
                <button type="button" onClick={() => handleClone(widget.id)}>
                  Clone
                </button>{" "}
                <button type="button" onClick={() => handleToggleDemo(widget)}>
                  {widget.on_demo === 0 ? "Add to demo" : "Remove from demo"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>
        <button type="button" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "New widget"}
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
    <div>
      <div>
        <label>
          Prompt
          <br />
          <textarea
            value={prompt}
            onChange={(ev) => setPrompt(ev.target.value)}
            rows={3}
            cols={60}
          />
        </label>
      </div>
      <div>
        <label>
          Connector{" "}
          <select value={connectorId} onChange={(ev) => setConnectorId(ev.target.value)}>
            {CONNECTORS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {schema && (
        <div style={{ fontSize: "0.9em", color: "#444", marginBottom: 8 }}>
          {schema.tables.map((table) => (
            <div key={table.name}>
              <strong>{table.name}</strong>{" "}
              {table.columns.map((c, i) => (
                <span key={c.name}>
                  {i > 0 && ", "}
                  {c.name} <em>{c.type}</em>
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      <p>
        <button type="button" disabled={busy || !prompt} onClick={handleGenerate}>
          Generate
        </button>
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {preview && (
        <>
          <pre>{preview.sql}</pre>
          <DataGrid columns={preview.columns} rows={preview.rows} />

          <div>
            <label>
              Name{" "}
              <input type="text" value={name} onChange={(ev) => setName(ev.target.value)} />
            </label>{" "}
            <button type="button" disabled={busy || !name} onClick={handleSave}>
              Save
            </button>
          </div>
        </>
      )}
    </div>
  );
}
