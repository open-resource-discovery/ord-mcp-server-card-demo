import { describe, it, snapshot, before, after } from "node:test";
import assert from "node:assert";
import type { Server } from "node:http";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import express from "express";
import { createOrdRouter } from "./ordRouter.js";

const require = createRequire(import.meta.url);
snapshot.setResolveSnapshotPath(
  (testPath: string | undefined) =>
    (testPath ?? "").replace(/dist[/\\]/, "src/") + ".snapshot",
);

const documentSchema = JSON.parse(
  readFileSync(
    require.resolve("@open-resource-discovery/specification/dist/generated/spec/v1/schemas/Document.schema.json"),
    "utf-8",
  ),
);
const configSchema = JSON.parse(
  readFileSync(
    require.resolve("@open-resource-discovery/specification/dist/generated/spec/v1/schemas/Configuration.schema.json"),
    "utf-8",
  ),
);
const Ajv = require("ajv").default;
const addFormats = require("ajv-formats");

let server: Server;
let baseUrl: string;
let document: Record<string, any>;

before(async () => {
  const app = express();
  app.use(
    createOrdRouter(
      "https://catalog.example",
      ["http://127.0.0.1:19999"],
      ["https://spaceship.example"],
    ),
  );
  await new Promise<void>((resolve, reject) => {
    server = app.listen(0, "127.0.0.1", (error?: Error) =>
      error ? reject(error) : resolve(),
    );
  });
  const address = server.address();
  assert.ok(address && typeof address === "object");
  baseUrl = `http://127.0.0.1:${address.port}`;
  document = (await (
    await fetch(`${baseUrl}/ord/v1/documents/catalog`)
  ).json()) as Record<string, any>;
});
after(
  () =>
    new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    ),
);

function validate(schema: object, data: unknown): void {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const check = ajv.compile(schema);
  assert.ok(check(data), JSON.stringify(check.errors, null, 2));
}

describe("Catalog Agent ORD Schema Validation", () => {
  it("published ORD document validates against official Document.schema.json", () => {
    validate(documentSchema, document);
  });
  it("published ORD document matches snapshot", (t) => {
    t.assert.snapshot(document);
  });
  it("describes the configured spaceship MCP server", () => {
    assert.strictEqual(document.apiResources.length, 1);
    assert.strictEqual(document.apiResources[0].apiProtocol, "mcp");
    assert.deepStrictEqual(document.apiResources[0].entryPoints, [
      "https://spaceship.example/mcp",
    ]);
  });
  it("provides a public MCP Server Card definition", () => {
    const definition = document.apiResources[0].resourceDefinitions[0];
    assert.strictEqual(definition.mediaType, "application/json");
    assert.strictEqual(
      definition.url,
      "https://spaceship.example/.well-known/mcp/server-card",
    );
  });
  it("published configuration validates against Configuration.schema.json", async () => {
    const config = await (
      await fetch(`${baseUrl}/.well-known/open-resource-discovery`)
    ).json();
    validate(configSchema, config);
    assert.strictEqual(
      config.openResourceDiscoveryV1.documents[0].url,
      "/ord/v1/documents/catalog",
    );
  });
});
