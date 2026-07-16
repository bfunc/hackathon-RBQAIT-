### BFF

fulstack-app - confidence: 80%
One deployable, frontend+API together, minimal DevOps — for a hackathon this is close to a free win regardless of what runs inside it. I wouldn't spend debate time here unless your team already has a strong reason to split (e.g., someone wants to write the AI/schema layer in Python). On the BFF choice itself - this isn't really where the architectural risk lives.

The real question:

### How should AI generate SQL

Here are 4 alternatives, each targeting the actual risk (SQL text generation is unconstrained, hard to validate, and dialect-fragile).

## 1. Structured query-spec DSL instead of raw SQL — confidence: 75%, this is probably the better architecture

AI doesn't output SQL text. It outputs a small constrained JSON spec: {table, columns, filters, groupBy, aggregations, sort} — deliberately shaped like AG-Grid's own filter/sort model. A deterministic (non-AI) builder then turns that spec into SQL per connector dialect.

Why this is genuinely stronger, not just safer:

- Widgets are inherently structured queries (filter/sort/aggregate on columns) — you're not building a general BI tool, you're building dashboard widgets. The DSL matches the actual problem shape.
- Dialect handling becomes a small deterministic function per connector (spec → SQL), not "hope the LLM knows MySQL's LIMIT quirks." Far more testable, zero LLM flakiness on syntax.
- Injection risk mostly disappears — you're building parameterized queries from a constrained shape, not executing arbitrary AI-generated text.
- AG-Grid can also produce this same spec shape client-side (its own filter model), so you get a nice symmetry: AI generates the initial spec from a prompt, and the same spec format could later be hand-edited via the grid's own filter UI. That's a demo-able "wow" moment for judges.

Tradeoff: constrained DSLs can't express everything arbitrary SQL can (complex subqueries, weird joins). For widget-style analytics queries this is rarely a real limitation.

## 2. Raw SQL text, but validated/re-planned by a second deterministic pass — confidence: 40%

Keep AI-generates-SQL, but add a real SQL parser (e.g. node-sql-parser) that parses the AI's output into an AST, validates it's read-only and touches only known tables/columns, and could even rewrite dialect-specific syntax deterministically instead of trusting the AI to get it right per-dialect.

- Keeps AI flexibility (arbitrary SQL) while buying back some of the safety/portability of option 1.
- Adds real engineering cost: you're now building a SQL parser/validator and a raw-SQL generator — more moving parts than option 1.
- The benefit (arbitrary query flexibility) is one a widget-dashboard use case probably doesn't need.

I'd only pick this over option 1 if you expect users to ask for genuinely complex analytical queries a filter/sort/aggregate DSL can't express.

## 3. Hibernate/HQL-based backend — confidence: 25%

Introduce a JVM service (Spring Boot + Hibernate) as the query layer. AI generates HQL against entity-mapped classes instead of raw SQL; Hibernate handles dialect translation to whatever relational DB sits underneath.

Pros

- Dialect portability is genuinely free — Hibernate's whole job is translating one query language to N SQL dialects, so you don't write per-connector translators at all for the DBs Hibernate supports.
- Entity-level querying can be a cleaner mental model than raw tables if your domain naturally maps to objects (e.g., User, Order with relationships) — joins via entity associations (u.orders) instead of manual JOIN ... ON.
- Mature, battle-tested tech — not something you're debugging for the first time under time pressure, if someone on the team already knows it well.

Cons

- Hibernate entities are normally defined at compile time as Java classes mapped to specific tables. Your pitch is dynamically pluggable connectors — discover schema at runtime, generate queries against whatever tables exist. That's in tension with how Hibernate/HQL is meant to be used; making entities truly dynamic (generated/reflected at runtime) is possible but is itself a non-trivial engineering project, not a hackathon shortcut.
- LLMs have materially less HQL in their training data than SQL — expect more generation errors, more retries, harder debugging live during a demo.
- Loses the AG-Grid filter-model synergy from option 1 unless you rebuild an equivalent structured-DSL layer in Java yourself — at which point you're doing the same amount of work as option 1, just in Java, without the dialect-portability benefit actually being exercised (since a DSL→SQL builder wouldn't need Hibernate at all).

## 4. Split backend: Python (FastAPI) for AI+schema layer, thin JS frontend — confidence: 25%

Python's DB tooling (SQLAlchemy reflection, richer NL2SQL libraries) is more mature than the JS/TS equivalent, and dialect-specific quirks are better handled by mature libraries there.

- Ecosystem maturity is real: SQLAlchemy reflection and NL2SQL libraries are ahead of what JS/TS offers today.
- Cost is real too: two runtimes means two deploy targets, two dependency setups, and cross-language debugging under time pressure.
- The maturity gain rarely pays for that overhead in <48 hours, unless your team is materially stronger in Python than TS.

I'd rate this low for a hackathon specifically — this is more of a "if you had 2 weeks" architecture, not a hackathon one.

у меня по продукту такой вопрос. Как мы это представляем (продаем на словах, не по факту разрабатывает для демо) 
- как фичу внутри проекта, команда может себе скачать этот код (если  стек совпадает) и сами деплоить
- как внутрибанковсукий сервис, к которому другие команды подключаются по API например (пишут только схему их базы и тип SQL) 

