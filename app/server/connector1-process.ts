import { spawn, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/**
 * connector1 is bundled with this app: instead of requiring a separate `npm run start -w
 * connector1` process, the app spawns and owns connector1's HTTP server itself. The app still
 * talks to it over HTTP (see connectors.ts) — only the process lifecycle is managed here.
 *
 * connector2, by contrast, represents a genuinely separate/remote service and is NOT started
 * from here; it keeps running as its own process (see root package.json's `dev` script) or a
 * real remote deployment reachable via CONNECTOR2_URL.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const connectorDir = join(__dirname, "..", "..", "connector1");
const connector1Url = process.env["CONNECTOR1_URL"] ?? "http://localhost:4001";

let child: ChildProcess | undefined;
let started = false;

async function isUp(): Promise<boolean> {
  try {
    const res = await fetch(`${connector1Url}/schema`);
    return res.ok;
  } catch {
    return false;
  }
}

async function waitUntilUp(timeoutMs = 15_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isUp()) return;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`connector1 did not become ready at ${connector1Url} within ${timeoutMs}ms`);
}

export async function startConnector1(): Promise<void> {
  if (started) return;
  started = true;

  // If something (e.g. a manually started instance) is already listening, reuse it.
  if (await isUp()) {
    return;
  }

  child = spawn("npm", ["run", "start"], {
    cwd: connectorDir,
    stdio: "pipe",
    shell: true,
    env: process.env,
  });

  child.stdout?.on("data", (chunk: Buffer) => {
    process.stdout.write(`[connector1] ${chunk}`);
  });
  child.stderr?.on("data", (chunk: Buffer) => {
    process.stderr.write(`[connector1] ${chunk}`);
  });
  child.on("exit", (code, signal) => {
    if (code !== 0 && code !== null) {
      console.error(`[connector1] process exited with code ${code} (signal ${signal})`);
    }
  });

  const stopChild = () => {
    child?.kill();
  };
  process.once("exit", stopChild);
  process.once("SIGINT", stopChild);
  process.once("SIGTERM", stopChild);

  await waitUntilUp();
}
