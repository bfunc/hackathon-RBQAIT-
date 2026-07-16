import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Database from "better-sqlite3";
import type { SchemaInfo, TableInfo, QueryRequest, QueryResult } from "./shared";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "data.db");
const PORT = Number(process.env["PORT"]) || 4001;

const IDENTIFIER_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

function getSchema(): SchemaInfo {
  const db = new Database(dbPath, { readonly: true, fileMustExist: true });
  try {
    const tableRows = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .all() as { name: string }[];

    const tables: TableInfo[] = tableRows
      .filter((t) => IDENTIFIER_RE.test(t.name))
      .map((t) => {
        const columns = (db.prepare(`PRAGMA table_info(${t.name})`).all() as any[]).map((c) => ({
          name: c.name as string,
          type: c.type as string,
        }));
        const foreignKeys = (db.prepare(`PRAGMA foreign_key_list(${t.name})`).all() as any[]).map((fk) => ({
          column: fk.from as string,
          referencesTable: fk.table as string,
          referencesColumn: fk.to as string,
        }));
        return { name: t.name, columns, foreignKeys };
      });

    return { dialect: "sqlite", tables };
  } finally {
    db.close();
  }
}

function runQuery(sql: string): QueryResult {
  const db = new Database(dbPath, { readonly: true, fileMustExist: true });
  try {
    const stmt = db.prepare(sql);
    const rows = stmt.all() as Record<string, unknown>[];
    const columns = stmt.columns().map((c) => c.name);
    const limited = rows.slice(0, 500);
    return { columns, rows: limited.map((row) => columns.map((c) => row[c])) };
  } finally {
    db.close();
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(payload);
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/schema") {
      sendJson(res, 200, getSchema());
      return;
    }

    if (req.method === "POST" && req.url === "/query") {
      const body = await readBody(req);
      let parsed: QueryRequest;
      try {
        parsed = JSON.parse(body);
      } catch {
        sendJson(res, 400, { error: "Invalid JSON body" });
        return;
      }

      try {
        const result = runQuery(parsed.sql);
        sendJson(res, 200, result);
      } catch (err) {
        sendJson(res, 400, { error: err instanceof Error ? err.message : String(err) });
      }
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (err) {
    sendJson(res, 400, { error: err instanceof Error ? err.message : String(err) });
  }
});

server.listen(PORT, () => {
  console.log(`connector1 listening on http://localhost:${PORT}`);
});
