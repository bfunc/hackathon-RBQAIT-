# Widget Spec

**Decision:** AI generates ready-to-run SQL once at create-time. No DSL, no query builder, no view-time parameters — the stored SQL is frozen and replayed as-is. (Earlier DSL-based design superseded; see git history and TECH-STACK.md for the alternatives considered.)

## Flow

```
User prompt ──┐
              ├──► AI (create-time only) ──► SQL ──► Guardrail check ──► Preview ──► saved widget
Connector ────┘                                          │                  │
schema (tables, columns,                                 │ reject if not    │ admin sees SQL + sample
types, FKs) + dialect                                    │ single SELECT    │ rows, confirms
```

1. **Create-time:** user prompt + connector schema + dialect (e.g. `"sqlite"`) go to the AI, which returns one ready-to-run SQL statement for that dialect.
2. **Guardrail:** BFF rejects anything that isn't a single read-only `SELECT`. Connector additionally opens its DB connection read-only, so writes fail hard regardless.
3. **Preview:** admin sees the generated SQL **and** sample rows before saving — the human is the semantic validator.
4. **View-time:** stored SQL → connector executes → rows render. No AI, no parameters, no rewriting on this path.

## Widget record

```json
{
  "id": "w_42",
  "name": "Deals closed this month by banker",
  "prompt": "deals closed this month by banker",
  "connectorId": "demo-sqlite",
  "sql": "SELECT b.name, COUNT(*) AS deals_closed, SUM(d.fee) AS total_fees FROM deals d LEFT JOIN bankers b ON b.id = d.lead_banker_id WHERE d.stage = 'closed' AND d.close_date >= date('now','start of month') GROUP BY b.name ORDER BY total_fees DESC LIMIT 50"
}
```

## Rules

- **Relative dates are baked into SQL, not parameterized** — "this month" becomes `date('now','start of month')` (SQLite-native), so the widget stays live as months roll over with zero parameter machinery.
- **Single statement, `SELECT` only** — checked by the BFF before saving; the connector's read-only connection is the backstop.
- **No view-time inputs from the frontend reach the SQL** — nothing to inject because nothing is interpolated or bound at view-time.
- **Schema drift is accepted** — if the connector's schema changes, saved widgets may break at view-time; surface the error, offer "regenerate from prompt."

## Connector contract

A connector is a standalone HTTP service (plain `node:http`, no framework) with its own database. The BFF talks to it only over this API:

- `GET /schema` → `{ dialect, tables: [{ name, columns: [{ name, type }], foreignKeys }] }` (fed to the AI prompt at create-time)
- `POST /query` body `{ sql }` → `{ columns, rows }`, or HTTP 400 `{ error }` (read-only DB connection; runs stored SQL verbatim)

Request/response types live in the shared `packages/shared` workspace (types only, no runtime code) so BFF and connectors can't drift apart.

*Pitch-only, not in demo:* BFF passes the user's token to the connector; connector enforces field-level permissions — credible precisely because the connector is a separate process the BFF has no DB handle into.
