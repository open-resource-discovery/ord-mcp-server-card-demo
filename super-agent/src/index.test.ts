import { describe, it, after, before } from "node:test";
import assert from "node:assert";
import type { Server } from "node:http";

let server: Server;
let baseUrl: string;

before(async () => {
  process.env.PORT = "0";
  process.env.SERVER_URL = "http://localhost";
  process.env.SPACESHIP_URLS = "http://localhost:19999";
  process.env.ANTHROPIC_API_KEY = "test-key";
  const { app } = await import("./index.js");
  await new Promise<void>((resolve, reject) => {
    server = app.listen(0, (err?: Error) => err ? reject(err) : resolve());
  });
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;
  baseUrl = `http://localhost:${port}`;
});

after(() => {
  server?.close();
});

describe("Catalog Agent", () => {
  it("returns health ok", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json() as { status: string };
    assert.strictEqual(body.status, "ok");
  });

  it("serves ORD well-known config", async () => {
    const res = await fetch(`${baseUrl}/.well-known/open-resource-discovery`);
    assert.strictEqual(res.status, 200);
    const body = await res.json() as Record<string, unknown>;
    assert.ok(body.openResourceDiscoveryV1);
  });

  it("serves ORD catalog document", async () => {
    const res = await fetch(`${baseUrl}/ord/v1/documents/catalog`);
    assert.strictEqual(res.status, 200);
    const doc = await res.json() as { apiResources: unknown[] };
    assert.ok(Array.isArray(doc.apiResources));
    assert.strictEqual(doc.apiResources.length, 1);
  });
});
