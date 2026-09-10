import { readFileSync } from "node:fs";

const defaultSpaceshipUrls = "http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004";
const defaultOrdSpaceshipUrls = defaultSpaceshipUrls + ",http://localhost:3006,http://localhost:3007,http://localhost:3008";

function loadServerListFile(path: string | undefined): string[] | null {
  if (!path) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf-8")) as { servers?: string[] };
    return Array.isArray(parsed.servers) && parsed.servers.length > 0 ? parsed.servers : null;
  } catch {
    return null;
  }
}

const spaceshipUrls = (process.env.SPACESHIP_URLS ?? defaultSpaceshipUrls).split(",");

export const config = {
  port: parseInt(process.env.PORT ?? "3005", 10),
  serverUrl: process.env.SERVER_URL ?? `http://localhost:${process.env.PORT ?? "3005"}`,
  spaceshipUrls,
  publicSpaceshipUrls: (process.env.PUBLIC_SPACESHIP_URLS ?? process.env.SPACESHIP_URLS ?? defaultSpaceshipUrls).split(","),
  // All servers published in the ORD document — includes 2 extra servers not in Stage 2 config
  ordSpaceshipUrls: (process.env.ORD_SPACESHIP_URLS ?? defaultOrdSpaceshipUrls).split(","),
  publicOrdSpaceshipUrls: (process.env.PUBLIC_ORD_SPACESHIP_URLS ?? process.env.ORD_SPACESHIP_URLS ?? defaultOrdSpaceshipUrls).split(","),
  // Stage 2 hand-config: a readable file the presenter opens and edits live on stage.
  mcpServersFile: process.env.MCP_SERVERS_FILE,
  anthropicAuthToken: process.env.ANTHROPIC_AUTH_TOKEN,
  anthropicBaseUrl: process.env.ANTHROPIC_BASE_URL,
  ordDocUrl: `http://localhost:${process.env.PORT ?? "3005"}/ord/v1/documents/catalog`,
};

// Read fresh on every call so an on-stage edit to mcp-servers.json takes effect
// on the next Stage 2 run. Falls back to the env-derived list when no file is set.
export function loadStage2ServerUrls(): string[] {
  return loadServerListFile(config.mcpServersFile) ?? config.spaceshipUrls;
}
