# Architecture

```
                                   ┌──────────────────────┐
                                   │   AI API (cloud)     │
                                   │   prompt → SQL       │
                                   └──────────▲───────────┘
                                              │ create-time only
                                              │
   ┌────────────────┐             ┌───────────┴───────────┐              ┌───────────────┐
   │ connector1     │◄────────────┤                       ├─────────────►│ Connector B   │
   │ (node:http     │  HTTP:      │          BFF          │  HTTP        │ (Postgres,    │
   │  service)      │  GET /schema│  - guardrail check    │              │  future)      │
   └───────┬────────┘  POST /query│    (single SELECT)    │              └───────┬───────┘
           │                      │  - widget store       │                      │
           ▼                      │    (own SQLite)       │                      ▼
   ┌───────────────┐              └──────────▲────────────┘              ┌───────────────┐
   │ Connector DB  │                         │                           │   Database    │
   │ (SQLite)      │                         │ tRPC                      └───────────────┘
   └───────────────┘                         │
                          ┌──────────────────┴─────────────────────┐
                          │                                        │
              ┌───────────▼────────────┐               ┌───────────▼──────────────────┐
              │  Admin backoffice      │               │  Demo page                   │
              │  "Widgets store"       │               │  "Show widget"               │
              │  - create via prompt   │               │  - renders selected widget   │
              │  - clone / configure   │               │    with live data            │
              │  - preview SQL + rows  │               │  - view-time only, no AI     │
              └────────────────────────┘               └──────────────────────────────┘
```

Both frontend views are pages served by the BFF itself (Vike) — no separate deploy, no microfrontend embed for the demo. (Production pitch: the "Show widget" view becomes an embeddable microfrontend on the target site.)

## Components

- **Connectors** — standalone HTTP services (plain `node:http`, no framework), one per external data source, each owning its DB. API: `GET /schema` (tables, columns, types, FKs, dialect string) and `POST /query` (runs SQL over a read-only connection). Demo ships one: `/connector1`, a SQLite file with the M&A deals dataset (bankers, clients, deals). *Pitch-only:* connector receives the user token and enforces field-level permissions.
- **BFF** — Vike + Fastify + tRPC. Calls connectors over HTTP, calls the AI API only at widget-create time, enforces the single-`SELECT` guardrail, stores widgets in its own SQLite DB (Kysely), serves both pages. Shares only TypeScript types with connectors via the `packages/shared` npm workspace — no runtime code crosses the boundary.
- **AI API (cloud)** — stateless, called once per widget creation: prompt + connector schema + dialect in, one ready-to-run SQL statement out. Never called at view-time.
- **Admin backoffice** (page) — widget store: list, clone, create via prompt, configure; preview shows the generated SQL **and** sample rows before save.
- **Demo page** — shows a selected widget rendering live data fetched through the BFF from the connector DB.

## Data flow

1. **Create-time:** admin page → BFF → (connector schema + dialect + user prompt) → AI API → SQL → guardrail check → connector executes for preview → admin confirms → widget saved (prompt + SQL).
2. **View-time:** demo page → BFF → stored SQL → connector executes → rows → widget renders. No AI, no parameters, no SQL rewriting.

Details and rules: [SPECS.md](SPECS.md).
