import type { SchemaInfo, QueryRequest, QueryResult } from "../shared";

export interface Connector {
  getSchema(): Promise<SchemaInfo>;
  execute(sql: string): Promise<QueryResult>;
}

class HttpConnector implements Connector {
  constructor(private readonly baseUrl: string) {}

  async getSchema(): Promise<SchemaInfo> {
    const res = await fetch(`${this.baseUrl}/schema`);
    if (!res.ok) {
      throw new Error(`connector schema request failed: ${res.status}`);
    }
    return (await res.json()) as SchemaInfo;
  }

  async execute(sql: string): Promise<QueryResult> {
    const res = await fetch(`${this.baseUrl}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql } satisfies QueryRequest),
    });
    const body = (await res.json()) as QueryResult | { error: string };
    if (!res.ok) {
      throw new Error((body as { error: string }).error);
    }
    return body as QueryResult;
  }
}

const connectors = new Map<string, Connector>([
  // connector1 is bundled with the app: the app process spawns and owns it (see
  // server/connector1-process.ts), but it's still reached over HTTP.
  ["connector1", new HttpConnector(process.env["CONNECTOR1_URL"] ?? "http://localhost:4001")],
  // connector2 is a genuinely separate/remote service: it must already be running
  // independently (locally on its own port, or deployed remotely) and is never
  // started by the app.
  ["connector2", new HttpConnector(process.env["CONNECTOR2_URL"] ?? "http://localhost:4002")],
]);

export function getConnector(id: string): Connector {
  const connector = connectors.get(id);
  if (!connector) {
    throw new Error(`unknown connector: ${id}`);
  }
  return connector;
}
