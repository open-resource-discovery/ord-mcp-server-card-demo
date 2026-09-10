import express, { type Express } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

export interface ToolCardDef {
  name: string;
  title?: string;
  description: string;
  annotations?: {
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
  };
  inputSchema: {
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

export interface ServerCardConfig {
  name: string;       // reverse-DNS: "spaceship.demo/thruster-control"
  title: string;      // "Thruster Control"
  version: string;
  description: string; // max 100 chars
  tools: ToolCardDef[];
}

export function createSpaceshipServer(
  serverUrl: string,
  card: ServerCardConfig,
  registerTools: (server: McpServer) => void,
): Express {
  const app = express();
  app.use(express.json());

  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, mcp-session-id");
    if (_req.method === "OPTIONS") { res.sendStatus(200); return; }
    next();
  });

  const serverCard = {
    $schema: "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
    name: card.name,
    title: card.title,
    version: card.version,
    description: card.description,
    supportedProtocolVersions: ["2025-03-26"],
    remotes: [{ type: "streamable-http", url: `${serverUrl}/mcp` }],
    capabilities: { tools: {} },
    tools: card.tools.map((t) => ({
      name: t.name,
      title: t.title,
      description: t.description,
      annotations: t.annotations,
      inputSchema: {
        type: "object",
        properties: t.inputSchema.properties ?? {},
        required: t.inputSchema.required ?? [],
      },
    })),
  };

  app.get("/.well-known/mcp/server-card", (_req, res) => {
    res.json(serverCard);
  });

  // Stateless Streamable HTTP — new server instance per request
  app.post("/mcp", async (req, res) => {
    const server = new McpServer({ name: card.title, version: card.version });
    registerTools(server);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.get("/health", (_req, res) => res.json({ status: "ok", server: card.title }));

  return app;
}
