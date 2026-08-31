import Anthropic from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { fetchServerCard, type ServerCard } from "./catalog.js";
import { config } from "./config.js";

export type Stage = 1 | 2 | 3 | 4;

export interface AgentStep {
  type: "thinking" | "tool_call" | "tool_result" | "answer" | "ord";
  content: string;
  tool?: string;
  server?: string;
  url?: string;
}

export async function runAgent(
  userMessage: string,
  stage: Stage,
): Promise<{ answer: string; steps: AgentStep[]; toolCount: number; serverCount: number }> {
  const steps: AgentStep[] = [];
  const client = new Anthropic({
    ...(config.anthropicAuthToken ? { authToken: config.anthropicAuthToken } : {}),
    ...(config.anthropicBaseUrl ? { baseURL: config.anthropicBaseUrl } : {}),
  });

  // ─── STAGE 1: No MCP — plain LLM ─────────────────────────────────────────
  if (stage === 1) {
    steps.push({ type: "thinking", content: "No MCP tools. Sending message to Claude directly." });
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      tools: [],
      messages: [{ role: "user", content: userMessage }],
    });
    const answer = response.content.find((b) => b.type === "text")?.text ?? "";
    steps.push({ type: "answer", content: answer });
    return { answer, steps, toolCount: 0, serverCount: 0 };
  }

  // ─── STAGES 2–4: MCP enabled ──────────────────────────────────────────────
  const toolRoutes = new Map<string, { mcpUrl: string; serverTitle: string }>();
  const claudeTools: Anthropic.Messages.Tool[] = [];

  // Step 1: Discover servers
  let serverCards: { baseUrl: string; card: ServerCard }[] = [];

  if (stage === 2) {
    // Config-based: server URLs come from env config, not ORD
    steps.push({
      type: "thinking",
      content: `Using ${config.spaceshipUrls.length} server URLs from configuration. No ORD document.`,
    });
    const results = await Promise.all(
      config.spaceshipUrls.map(async (baseUrl) => {
        const card = await fetchServerCard(baseUrl);
        return card ? { baseUrl, card } : null;
      }),
    );
    serverCards = results.filter((r): r is { baseUrl: string; card: ServerCard } => r !== null);
  } else {
    // Stages 3 + 4: ORD document reveals server list
    steps.push({
      type: "ord",
      content: `Reading ORD document at ${config.serverUrl}/ord/v1/documents/catalog`,
      url: `${config.serverUrl}/ord/v1/documents/catalog`,
    });

    const ordRes = await fetch(config.ordDocUrl);
    const ordDoc = await ordRes.json() as {
      apiResources?: Array<{ resourceDefinitions?: Array<{ type: string; url: string }> }>;
    };
    const serverCardUrls = (ordDoc.apiResources ?? [])
      .flatMap((api) => api.resourceDefinitions ?? [])
      .filter((def) => def.type === "mcp-server-card" && def.url)
      .map((def) => def.url);

    steps.push({
      type: "thinking",
      content: `Found ${serverCardUrls.length} MCP servers in ORD. Fetching Server Cards...`,
    });

    const results = await Promise.all(
      config.spaceshipUrls.map(async (baseUrl) => {
        const card = await fetchServerCard(baseUrl);
        return card ? { baseUrl, card } : null;
      }),
    );
    serverCards = results.filter((r): r is { baseUrl: string; card: ServerCard } => r !== null);
  }

  // Step 2: Build tool catalog
  if (stage === 4) {
    // ─── STAGE 4: Tool metadata from Server Card — no live connections needed ─
    for (const { card } of serverCards) {
      const mcpUrl = card.remotes[0]?.url;
      if (!mcpUrl) continue;
      const serverTitle = card.title ?? card.name;
      for (const tool of card.tools ?? []) {
        toolRoutes.set(tool.name, { mcpUrl, serverTitle });
        claudeTools.push({
          name: tool.name,
          description: tool.description,
          input_schema: {
            type: "object" as const,
            properties: (tool.inputSchema?.properties as Record<string, Anthropic.Messages.Tool["input_schema"]>) ?? {},
            required: tool.inputSchema?.required ?? [],
          },
        });
      }
    }
    steps.push({
      type: "thinking",
      content: `Loaded ${claudeTools.length} tools from ${serverCards.length} Server Cards. No live connections needed.`,
    });
  } else {
    // ─── STAGES 2 + 3: Must connect to each server and call tools/list ────────
    steps.push({
      type: "thinking",
      content: `No tool metadata in cards. Connecting to all ${serverCards.length} servers to discover tools...`,
    });

    for (const { card } of serverCards) {
      const mcpUrl = card.remotes[0]?.url;
      if (!mcpUrl) continue;
      const serverTitle = card.title ?? card.name;

      steps.push({ type: "tool_call", content: `Calling tools/list on ${mcpUrl}`, server: serverTitle });

      const mcpClient = new Client({ name: "catalog-agent", version: "1.0.0" }, { capabilities: {} });
      const transport = new StreamableHTTPClientTransport(new URL(mcpUrl));
      await mcpClient.connect(transport);
      const { tools } = await mcpClient.listTools();
      await mcpClient.close();

      steps.push({
        type: "tool_result",
        content: `Found ${tools.length} tools: ${tools.map((t) => t.name).join(", ")}`,
        server: serverTitle,
      });

      for (const tool of tools) {
        toolRoutes.set(tool.name, { mcpUrl, serverTitle });
        claudeTools.push({
          name: tool.name,
          description: tool.description ?? "",
          input_schema: {
            type: "object" as const,
            properties: (tool.inputSchema.properties as Record<string, Anthropic.Messages.Tool["input_schema"]>) ?? {},
            required: (tool.inputSchema as { required?: string[] }).required ?? [],
          },
        });
      }
    }

    steps.push({
      type: "thinking",
      content: `Discovered ${claudeTools.length} tools across ${serverCards.length} servers via live connections. Asking Claude...`,
    });
  }

  const messages: Anthropic.Messages.MessageParam[] = [{ role: "user", content: userMessage }];

  // ─── Agentic loop — identical for stages 2, 3, 4 ─────────────────────────
  while (true) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      tools: claudeTools,
      messages,
    });

    if (response.stop_reason === "end_turn") {
      const answer = response.content.find((b) => b.type === "text")?.text ?? "";
      steps.push({ type: "answer", content: answer });
      return { answer, steps, toolCount: claudeTools.length, serverCount: serverCards.length };
    }

    if (response.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content: response.content });
      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type !== "tool_use") continue;

        const route = toolRoutes.get(block.name);
        if (!route) {
          toolResults.push({ type: "tool_result", tool_use_id: block.id, content: "Tool not found" });
          continue;
        }

        steps.push({
          type: "tool_call",
          content: `Calling ${block.name} with args: ${JSON.stringify(block.input)}`,
          tool: block.name,
          server: route.serverTitle,
        });

        const mcpClient = new Client({ name: "catalog-agent", version: "1.0.0" }, { capabilities: {} });
        const transport = new StreamableHTTPClientTransport(new URL(route.mcpUrl));
        await mcpClient.connect(transport);
        const result = await mcpClient.callTool({ name: block.name, arguments: block.input as Record<string, unknown> });
        await mcpClient.close();

        const resultContent = result.content as Array<{ type: string; text?: string }>;
        const resultText = resultContent.find((c) => c.type === "text")?.text ?? JSON.stringify(result.content);

        steps.push({ type: "tool_result", content: resultText, tool: block.name, server: route.serverTitle });
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: resultText });
      }

      messages.push({ role: "user", content: toolResults });
    }
  }
}
