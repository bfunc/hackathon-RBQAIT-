export const config = { runtime: "edge" };

const OPENAI_BASE_URL = "https://api.openai.com";

export default async function handler(req: Request): Promise<Response> {
  const proxySecret = process.env.PROXY_SECRET;
  if (proxySecret) {
    const provided = req.headers.get("x-proxy-key");
    if (provided !== proxySecret) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "proxy misconfigured: OPENAI_API_KEY not set" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, "");
  const targetUrl = `${OPENAI_BASE_URL}${path}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("x-proxy-key");
  headers.set("authorization", `Bearer ${apiKey}`);

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
    // @ts-expect-error required by undici/fetch when streaming a request body
    duplex: "half",
  });

  const responseHeaders = new Headers(response.headers);
  // `fetch` transparently decompresses the body, so these headers would describe bytes we no
  // longer have — forwarding them causes the client to fail decoding/parsing the response.
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}
