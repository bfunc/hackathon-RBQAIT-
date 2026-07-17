import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";

try {
  if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile(".env");
  } else {
    for (const [key, value] of Object.entries(parseEnv(readFileSync(".env", "utf8")))) {
      process.env[key] ??= value;
    }
  }
} catch {
  // .env is optional
}

const PORT = Number(process.env["PORT"]) || 8787;
const OPENAI_BASE_URL = "https://api.openai.com";

const server = createServer(async (req, res) => {
  const proxySecret = process.env["PROXY_SECRET"];
  if (proxySecret && req.headers["x-proxy-key"] !== proxySecret) {
    res.writeHead(401, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "unauthorized" }));
    return;
  }

  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "proxy misconfigured: OPENAI_API_KEY not set" }));
    return;
  }

  const targetUrl = `${OPENAI_BASE_URL}${req.url}`;

  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value || ["host", "x-proxy-key", "content-length"].includes(key)) continue;
    headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }
  headers.set("authorization", `Bearer ${apiKey}`);

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
  });

  const responseHeaders = new Headers(response.headers);
  // `fetch` transparently decompresses the body, so these headers would describe bytes we no
  // longer have — forwarding them causes the client to fail decoding/parsing the response.
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  res.writeHead(response.status, Object.fromEntries(responseHeaders));
  res.end(Buffer.from(await response.arrayBuffer()));
});

server.listen(PORT, () => {
  console.log(`openai-proxy (local dev) listening on http://localhost:${PORT}`);
});
