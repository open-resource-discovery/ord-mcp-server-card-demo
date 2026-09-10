export interface ServerCard {
  $schema?: string;
  name: string;
  title?: string;
  version: string;
  description: string;
  supportedProtocolVersions: string[];
  remotes: Array<{ type: string; url: string }>;
  capabilities: { tools?: object; resources?: object; prompts?: object };
  tools?: Array<{
    name: string;
    title?: string;
    description: string;
    inputSchema?: { type?: string; properties?: Record<string, unknown>; required?: string[] };
    annotations?: { readOnlyHint?: boolean; destructiveHint?: boolean; idempotentHint?: boolean };
  }>;
  _meta?: Record<string, unknown>;
  tags?: string[];
}

export async function fetchServerCard(baseUrl: string): Promise<ServerCard | null> {
  try {
    const res = await fetch(`${baseUrl}/.well-known/mcp/server-card`);
    if (!res.ok) return null;
    return (await res.json()) as ServerCard;
  } catch {
    return null;
  }
}

export async function fetchAllServerCards(spaceshipUrls: string[]): Promise<Array<{ baseUrl: string; card: ServerCard }>> {
  const results = await Promise.all(
    spaceshipUrls.map(async (baseUrl) => {
      const card = await fetchServerCard(baseUrl);
      return card ? { baseUrl, card } : null;
    }),
  );
  return results.filter((r): r is { baseUrl: string; card: ServerCard } => r !== null);
}
