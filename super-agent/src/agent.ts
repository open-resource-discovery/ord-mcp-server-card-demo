import Anthropic from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { fetchServerCard, type ServerCard } from "./catalog.js";
import { config } from "./config.js";

export interface AgentStep {
  type: "thinking" | "tool_call" | "tool_result" | "answer" | "ord";
  content: string;
  tool?: string;
  server?: string;
  url?: string;
}

export async function runPoorAgent(
  userMessage: string,
  withDiscovery: boolean,
): Promise<{ answer: string; steps: AgentStep[]; toolCount?: number; serverCount?: number }> {
  const steps: AgentStep[] = [];
  const client = new Anthropic({
    ...(config.anthropicAuthToken ? { authToken: config.anthropicAuthToken } : {}),
    ...(config.anthropicBaseUrl ? { baseURL: config.anthropicBaseUrl } : {}),
  });

  if (!withDiscovery) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [{ role: "user", content: userMessage }],
    });
    const answer = response.content.find((b) => b.type === "text")?.text ?? "";
    return { answer, steps };
  }

  // Step 1: Read ORD document
  steps.push({
    type: "ord",
    content: `Reading ORD document at ${config.serverUrl}/ord/v1/documents/catalog`,
    url: `${config.serverUrl}/ord/v1/documents/catalog`,
  });

  const ordRes = await fetch(config.ordDocUrl);
  const ordDoc = await ordRes.json() as {
    apiResources?: Array<{
      resourceDefinitions?: Array<{ type: string; url: string }>;
    }>;
  };

  const serverCardUrls = (ordDoc.apiResources ?? [])
    .flatMap((api) => api.resourceDefinitions ?? [])
    .filter((def) => def.type === "mcp-server-card" && def.url)
    .map((def) => def.url);

  steps.push({
    type: "thinking",
    content: `Found ${serverCardUrls.length} MCP servers in ORD. Fetching Server Cards...`,
  });

  // Step 2: Fetch Server Cards
  const serverCardResults = await Promise.all(
    serverCardUrls.map(async (cardUrl) => {
      const baseUrl = cardUrl.replace("/.well-known/mcp-server-card.json", "");
      const card = await fetchServerCard(baseUrl);
      return card ? { baseUrl, card } : null;
    }),
  );
  const serverCards = serverCardResults.filter(
    (r): r is { baseUrl: string; card: ServerCard } => r !== null,
  );

  // Step 3: Build tool catalog from Server Cards
  const toolRoutes = new Map<string, { mcpUrl: string; serverTitle: string }>();
  const claudeTools: Anthropic.Messages.Tool[] = [];

  for (const { card } of serverCards) {
    const mcpUrl = card.remotes[0]?.url;
    if (!mcpUrl) continue;
    for (const tool of card.tools ?? []) {
      toolRoutes.set(tool.name, { mcpUrl, serverTitle: card.title ?? card.name });
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
    content: `Loaded ${claudeTools.length} tools from ${serverCards.length} Server Cards. Asking Claude to respond...`,
  });

  const messages: Anthropic.Messages.MessageParam[] = [
    { role: "user", content: userMessage },
  ];

  // Agentic loop
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

        steps.push({
          type: "tool_result",
          content: resultText,
          tool: block.name,
          server: route.serverTitle,
        });

        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: resultText });
      }

      messages.push({ role: "user", content: toolResults });
    }
  }
}
