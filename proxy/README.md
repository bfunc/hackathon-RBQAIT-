# openai-proxy

A thin proxy in front of the OpenAI API, deployed as a Vercel Edge Function. Point clients at this
deployment's URL instead of `api.openai.com` directly when the target machine can't reach OpenAI itself.

Every path/method/body is forwarded as-is to `https://api.openai.com`, with the real `OPENAI_API_KEY`
attached server-side. Callers never see the key.

## Deploy on Vercel

This lives in a monorepo, so when creating the Vercel project from GitHub:

1. Import the repo.
2. In **Project Settings → General → Root Directory**, set it to `proxy`.
3. In **Project Settings → Environment Variables**, add:
   - `OPENAI_API_KEY` — your real OpenAI key.
   - `PROXY_SECRET` (optional but recommended) — any random string. If set, callers must send it back
     in an `x-proxy-key` header, otherwise anyone who finds the URL can spend your OpenAI credits.
4. Deploy. No build command needed — Vercel picks up `api/[...path].ts` automatically.

## Using it from the target machine

Point your OpenAI client at the proxy instead of `api.openai.com`, keeping the rest of the request shape
identical (paths like `/v1/chat/completions` still work):

```ts
const client = new OpenAI({
  apiKey: "unused", // the proxy injects the real key; this can be any non-empty string
  baseURL: "https://<your-deployment>.vercel.app/api/v1",
  defaultHeaders: { "x-proxy-key": "<PROXY_SECRET, if you set one>" },
});
```

## Local dev

`npm run dev` (root) starts this alongside `app` and `connector1` via `dev-server.ts` — a plain Node
HTTP server that mirrors `api/[...path].ts`'s forwarding logic, listening on `http://localhost:8787`
(reads `proxy/.env` for `OPENAI_API_KEY` / `PROXY_SECRET` / `PORT`). It's dev-only tooling; the actual
Vercel deployment always runs `api/[...path].ts` as an Edge Function.

