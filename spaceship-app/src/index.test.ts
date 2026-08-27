import { describe, it, after, before } from "node:test";
import assert from "node:assert";
import type { Server } from "node:http";
import type { Express } from "express";

let server: Server;
let baseUrl: string;

before(async () => {
  process.env.PORT = "0";
  process.env.SERVER_URL = "http://localhost";
  process.env.SERVER_TYPE = "thruster";
  const { createThrusterServer } = await import("./servers/thruster.js");
  const app: Express = createThrusterServer("http://localhost");
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

describe("Spaceship MCP Server", () => {
  it("returns health ok", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json() as { status: string; server: string };
    assert.strictEqual(body.status, "ok");
    assert.strictEqual(body.server, "Thruster Control");
  });

  it("serves Server Card at well-known endpoint", async () => {
    const res = await fetch(`${baseUrl}/.well-known/mcp-server-card.json`);
    assert.strictEqual(res.status, 200);
    const card = await res.json() as Record<string, unknown>;
    assert.strictEqual(card.name, "spaceship.demo/thruster-control");
    assert.strictEqual(card.title, "Thruster Control");
    assert.ok(Array.isArray(card.tools));
    assert.ok((card.tools as unknown[]).length >= 3);
  });

  it("Server Card includes MCP transport URL", async () => {
    const res = await fetch(`${baseUrl}/.well-known/mcp-server-card.json`);
    const card = await res.json() as { remotes: Array<{ type: string; url: string }> };
    assert.ok(Array.isArray(card.remotes));
    assert.strictEqual(card.remotes[0].type, "streamable-http");
    assert.ok(card.remotes[0].url.endsWith("/mcp"));
  });
});
