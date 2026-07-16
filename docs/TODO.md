# TODO — build plan

Read `ARCHITECTURE.md` and `SPECS.md` (same folder) first. They are the source of truth for what this app does. Summary: admin types a prompt → AI generates one ready-to-run SQLite `SELECT` at create-time → admin previews SQL + rows → widget is saved → demo page replays the stored SQL verbatim. No DSL, no query builder, no view-time parameters, no AI at view-time.

Repo layout (monorepo with npm workspaces):

- `/app` — the BFF: Vike + vike-react, Fastify, tRPC v11 (`trpc/server.ts`, handler in `server/trpc-handler.ts`, client in `trpc/client.ts`), Kysely + better-sqlite3 (`database/kysely/`), oxlint. `DATABASE_URL` in `app/.env` points to the BFF's own SQLite file. Already scaffolded — don't re-scaffold.
- `/connector1` — the demo connector: a **standalone HTTP service** (plain `node:http`, no framework) with its own SQLite DB. **Does not exist yet — Tasks 1–2 create it.** The BFF talks to it only over HTTP — no code imports between `/app` and `/connector1`.
- `/packages/shared` — types-only workspace package (`@hackathon/shared`): the connector API request/response shapes both sides import. **Does not exist yet — Task 2 creates it.** This is the only thing that crosses the BFF/connector boundary, and it's types, not runtime code.
- `/docs` — specs and this plan.

Root `package.json` does not exist yet — Task 1 creates it with `"workspaces": ["app", "connector1", "packages/*"]`, `"private": true`, `"type": "module"`. After that, run `npm install` from the repo root (one lockfile, one node_modules), and run package scripts as `npm run <script> -w <package>` from root or plain `npm run <script>` inside the package folder.

Commands (run inside `/app` unless stated): `npm run kysely:migrate` after adding migrations, `npm run dev` to start, `npm run lint` before finishing.

Work the tasks in order — each depends on the previous. After each task, run the verification step listed for it before moving on.

---

## Task 1 — Workspace root + `/connector1` package with seed data

Create the root `package.json` (see repo-layout section above), then `/connector1` as a workspace package:

- `package.json` — name `"connector1"`, `"type": "module"`, dependencies: `better-sqlite3`; devDependencies: `tsx`, `typescript`, `@types/better-sqlite3`. Scripts: `"seed": "tsx ./seed.ts"`, `"start": "tsx ./server.ts"` (server.ts comes in Task 2).
- `tsconfig.json` — copy `/app/tsconfig.json` as the base, trim paths that don't apply.
- `data.db` — the connector's own SQLite file, created by the seed script in the package folder. Add a `connector1/.gitignore` with `data.db`.

Run `npm install` from the repo root after creating the manifests.

Write `connector1/seed.ts` using plain `better-sqlite3` (no Kysely here) that creates and populates:

- `bankers` — id INTEGER PK, name TEXT, coverage_team TEXT ('TMT' | 'Healthcare' | 'FIG' | 'Energy')
- `clients` — id INTEGER PK, name TEXT, sector TEXT, country TEXT
- `deals` — id INTEGER PK, client_id INTEGER REFERENCES clients(id), lead_banker_id INTEGER REFERENCES bankers(id), deal_type TEXT ('M&A' | 'IPO' | 'bond' | 'loan'), deal_value REAL, fee REAL, stage TEXT ('prospecting' | 'mandate' | 'due_diligence' | 'signed' | 'closed' | 'dead'), created_date TEXT (ISO date), close_date TEXT NULL (ISO date, set only when stage is 'closed').

Declare the FKs in the DDL (`REFERENCES ...`) — Task 2 introspects them via `PRAGMA foreign_key_list`.

Seed volumes: ~8 bankers, ~20 clients, ~120 deals. Critical: spread `close_date` across the last 6 calendar months **relative to the run date** (compute dates in JS from `new Date()`, don't hardcode) with a meaningful cluster in the current month, so a "deals closed this month" widget always returns rows. Make fees/deal_values plausible (fees ~0.5–2% of deal_value; deal_value 50M–5000M). Script must be idempotent: `DROP TABLE IF EXISTS` then recreate.

**Verify:** `npm run seed` inside `/connector1` twice (idempotency), then a quick tsx check: `SELECT COUNT(*) FROM deals WHERE stage='closed' AND close_date >= date('now','start of month')` returns > 0.

## Task 2 — Shared types package, connector HTTP service, BFF client

**`/packages/shared`** — new workspace package `@hackathon/shared`, types only, no runtime code:

```ts
export interface SchemaInfo { dialect: string; tables: TableInfo[] }
export interface TableInfo { name: string; columns: { name: string; type: string }[]; foreignKeys: { column: string; referencesTable: string; referencesColumn: string }[] }
export interface QueryRequest { sql: string }
export interface QueryResult { columns: string[]; rows: unknown[][] }
```

`package.json` with name `@hackathon/shared` and a plain `"main"/"types"` pointing at the source `.ts` (both consumers run through tsx/vite, no build step needed). Add it as a dependency (`"@hackathon/shared": "*"`) in both `/app` and `/connector1`.

**`connector1/server.ts`** — plain `node:http`, no framework. `PORT` from env, default `4001`. Two routes, JSON only:

- `GET /schema` → `SchemaInfo`. Implement with `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`, then `PRAGMA table_info(<t>)` and `PRAGMA foreign_key_list(<t>)` per table. Table names come from sqlite_master, not user input, but still pass them through a `[A-Za-z_][A-Za-z0-9_]*` check before interpolating into PRAGMA.
- `POST /query` — body `QueryRequest` → `QueryResult`, or HTTP 400 `{ error: string }` if the SQL fails. Open the DB with `new SQLite(dbPath, { readonly: true, fileMustExist: true })` — the readonly flag is the hard safety backstop, not optional. Resolve `dbPath` relative to the module file (`import.meta.url`), not `process.cwd()`. Use `db.prepare(sql)`; get column names from `stmt.columns()`; cap rows returned at 500. Wrap prepare/execute in try/catch → 400.
- Anything else → 404. Keep it under ~100 lines; parse the body with a simple buffer-concat, no dependencies.

**BFF side** — `app/server/connectors.ts`: a `Connector` interface (`getSchema(): Promise<SchemaInfo>`, `execute(sql): Promise<QueryResult>` — types from `@hackathon/shared`) implemented with `fetch` against a base URL; a registry `Map<string, Connector>` with one entry `"connector1"` → `CONNECTOR1_URL` env var, default `http://localhost:4001`. On a 400 from `/query`, throw with the connector's error message (Task 5's `getWidgetData` catches it). tRPC procedures look connectors up by id (matches `connectorId` in the widget record).

**Verify:** start the connector (`npm run start -w connector1`), then from `/app` a tsx scratch script using the registry: `getSchema()` lists 3 tables with FKs on `deals`; `execute("SELECT COUNT(*) FROM deals")` returns a row; `execute("DELETE FROM deals")` rejects with the readonly error from the connector.

## Task 3 — Widgets table in the BFF db

Add Kysely migration `app/database/kysely/migrations/002_create_widgets_table.ts` (copy the up/down shape of `001_create_todos_table.ts`):

`widgets` — id (autoincrement PK), name TEXT NOT NULL, prompt TEXT NOT NULL, connector_id TEXT NOT NULL, sql TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT current timestamp.

Update `app/database/kysely/types.ts`: add `WidgetTable` to `Database` (keep `todos` for now — remove it and its migration/queries only in Task 6 when the example pages go away). Add `app/database/kysely/queries/widgets.ts` following the style of `queries/todos.ts`: `insertWidget`, `listWidgets`, `getWidgetById`, `cloneWidget` (fetch + reinsert with `name + " (copy)"`).

**Verify:** `npm run kysely:migrate` succeeds; insert + list round-trips in a scratch script.

## Task 4 — AI SQL generation + guardrail (in `/app`)

Install `ai` and `@ai-sdk/anthropic`. Env var `ANTHROPIC_API_KEY` (add to `app/.env`, document in `app/README.md`). Model: `claude-sonnet-5`.

Create `app/server/generate-sql.ts`:

- Build the prompt from: connector's `getSchema()` output rendered as compact DDL-like text, the dialect string, and the user's prompt. Instruct: return exactly one SQLite `SELECT`; relative dates via SQLite-native expressions (e.g. `date('now','start of month')`), never hardcoded dates; always include a `LIMIT` (500 max); no comments, no markdown fences, SQL text only.
- Use `generateText` (SQL is a string — `generateObject` adds nothing here). Strip markdown fences defensively anyway.
- Guardrail function `assertSingleSelect(sql: string)`: trim; strip a single trailing `;`; reject if any `;` remains inside; reject unless it starts with `SELECT` or `WITH` (case-insensitive); reject if any of `INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|ATTACH|PRAGMA|REPLACE|VACUUM` appears as a word (case-insensitive, `\b`-bounded). This is defense-in-depth on top of the readonly connection, not a parser — keep it simple.
- On guardrail failure: retry the AI call once with the rejection reason appended to the prompt; if it fails again, throw with a message the UI can show.

**Verify:** with a real key, generate SQL for "deals closed this month by banker" and run it through the connector — rows come back. Also unit-check `assertSingleSelect` rejects `DELETE FROM deals` and `SELECT 1; DROP TABLE deals`.

## Task 5 — tRPC procedures

Extend `app/trpc/server.ts` (follow the existing context pattern — `db` is already in context; import the connector registry from `server/connectors.ts`). Procedures:

- `generateWidget` — input `{ prompt: string, connectorId: string }`. Look up connector → `getSchema()` → `generateSql()` → guardrail → `connector.execute(sql)` for preview. Returns `{ sql, columns, rows }`. Does NOT save.
- `saveWidget` — input `{ name, prompt, connectorId, sql }`. Re-run the guardrail on the incoming sql (it round-tripped through the client — never trust it), then insert. Returns the widget.
- `listWidgets` — no input, returns all widgets.
- `cloneWidget` — input `{ id: number }`.
- `getWidgetData` — input `{ id: number }`. Load widget → look up its connector → `execute(widget.sql)` → `{ widget, columns, rows }`. Wrap execute in try/catch; on SQL error return a structured `{ error: string }` so the demo page can show "widget broken — regenerate" instead of a 500 (schema-drift case from SPECS.md).

Use zod for all inputs (install `zod`; the existing `onNewTodo` hand-rolled validator is not the pattern to copy).

**Verify:** `npm run lint` passes; exercise generate→save→getWidgetData through tRPC (scratch client script or via the UI in Task 6).

## Task 6 — Pages

Two Vike pages in `/app`, replacing the examples (`pages/todo`, `pages/star-wars`, `pages/index/Counter.tsx` can all be deleted; also remove todos queries/migration/types now):

- `pages/admin/+Page.tsx` — the widget store. List widgets (name, prompt, created_at) with Clone button. "New widget" form: prompt textarea + connector select (one option) → calls `generateWidget` → shows returned SQL in a `<pre>` and preview rows in a table → "Save" (name input) calls `saveWidget`. Show guardrail/AI errors inline.
- `pages/demo/+Page.tsx` — widget dropdown (from `listWidgets`), renders selected widget's data via `getWidgetData` as a plain HTML table (columns + rows as returned). Show the structured error state if the widget is broken. This page is the "demo page" from ARCHITECTURE.md — keep it clean, it's what judges see.

Use the existing `trpc/client.ts` proxy client with plain `useState`/`useEffect` or event handlers — TanStack Query integration is optional polish, not required for this task. Keep styling minimal (existing Layout.css); function over form.

**Verify:** `npm run dev`, then in the browser: create a widget from the prompt "deals closed this month by banker, with total fees", save it, open /demo, select it, see rows. Restart dev server — widget persists.

---

## Out of scope (do not build)

View-time parameters, AG-Grid, microfrontend embed, permissions/token pass-through (pitch-only), multiple connectors, non-SQLite dialects, DSL/query-builder layer, auth on the connector API, `pages/index` redesign (leave or make it link to /admin and /demo).
