# connector1 API — browser console test snippets

Make sure the connector is running first: `npm run start -w connector1` (from repo root) — listens on `http://localhost:4001`.

Paste any of the snippets below into the browser devtools console (on any page, or `http://localhost:4001`).

## GET /schema

```js
fetch("http://localhost:4001/schema")
  .then((r) => r.json())
  .then(console.log);
```

## POST /query — simple count

```js
fetch("http://localhost:4001/query", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ sql: "SELECT COUNT(*) as cnt FROM deals" }),
})
  .then((r) => r.json())
  .then(console.log);
```

## POST /query — deals closed this month by banker, with total fees

```js
fetch("http://localhost:4001/query", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sql: `
      SELECT b.name, COUNT(*) as n, SUM(d.fee) as total_fee
      FROM deals d
      JOIN bankers b ON b.id = d.lead_banker_id
      WHERE d.stage = 'closed' AND d.close_date >= date('now', 'start of month')
      GROUP BY b.name
    `,
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

## POST /query — bad SQL (expect 400 + error message)

```js
fetch("http://localhost:4001/query", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ sql: "SELECT * FROM not_a_table" }),
})
  .then(async (r) => console.log(r.status, await r.json()));
```

## POST /query — write attempt (expect 400, readonly connection blocks it)

```js
fetch("http://localhost:4001/query", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ sql: "DELETE FROM deals" }),
})
  .then(async (r) => console.log(r.status, await r.json()));
```

## GET /nope — unknown route (expect 404)

```js
fetch("http://localhost:4001/nope").then((r) => console.log(r.status));
```
