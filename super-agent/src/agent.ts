import Anthropic from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { fetchServerCard, type ServerCard } from "./catalog.js";
import { config, loadStage2ServerUrls } from "./config.js";

export type Stage = 1 | 2 | 3 | 4;

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

const MITHRA_PERSONA =
  "You are MITRA, the onboard AI copilot of a spacecraft, speaking with the ship's mission specialist during an emergency. Be calm, concise, and decisive.";

// Stage 1 has no connection to any ship system.
const SYSTEM_NO_TOOLS =
  `${MITHRA_PERSONA} You have NO connection to any ship system and NO tools. You cannot read live telemetry (temperatures, pressures, signal strength, position) and you cannot operate any equipment (thrusters, life support, comms). Do NOT invent sensor readings, numbers, or system states. Do NOT claim to be taking actions, executing commands, or adjusting anything. You can only reason from what the human tells you and give advice: likely causes, what they should check, and what to do manually. Whenever a step would require reading a sensor or operating a system, state plainly that you cannot do it yourself and explain what the human must do.`;

// Stages 2-4 have live tools wired to the ship's systems.
const SYSTEM_WITH_TOOLS =
  `${MITHRA_PERSONA} You are connected to the ship's systems through the tools provided. Use them to read real telemetry and to act — do not guess values you can measure, and do not claim to change anything you can do via a tool. Take the actions the situation calls for, then report what you did and what you found. If the situation calls for something you have no tool for, do not name or speculate about missing systems — instead, express that you cannot guarantee the situation is fully resolved and that your current access may be incomplete.`;

// Stage 2 adds awareness that the server list is hand-written and may not cover all ship systems.
const SYSTEM_STAGE2 =
  `${SYSTEM_WITH_TOOLS} Important: your connection to ship systems comes from a manually maintained configuration file. It may not list every system on board. After responding, always note that your assessment is limited to the systems in your current configuration and that there may be other ship systems you have no visibility into.`;


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
  history: ConversationTurn[] = [],
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
      temperature: 0,
      system: SYSTEM_NO_TOOLS,
      tools: [],
      messages: [
        ...history.map((h) => ({ role: h.role as "user" | "assistant", content: h.content })),
        { role: "user", content: userMessage },
      ],
    });
    const answer = response.content.find((b) => b.type === "text")?.text ?? "";
    steps.push({ type: "answer", content: answer });
    return { answer, steps, toolCount: 0, serverCount: 0 };
  }

  // ─── STAGES 2–4: MCP enabled ──────────────────────────────────────────────
  const toolRoutes = new Map<string, { mcpUrl: string; serverTitle: string }>();
  let claudeTools: Anthropic.Messages.Tool[] = [];

  // Step 1: Discover servers
  let serverCards: { baseUrl: string; card: ServerCard }[] = [];
  let failedUrls: string[] = [];

  if (stage === 2) {
    // Config-based: server URLs come from a hand-written file, not ORD
    const stage2Urls = loadStage2ServerUrls();
    steps.push({
      type: "thinking",
      content: `Reading hand-written config (mcp-servers.json): ${stage2Urls.length} server URLs.`,
    });
    const failedResults = await Promise.all(
      stage2Urls.map(async (baseUrl) => ({
        baseUrl,
        card: await fetchServerCard(baseUrl),
      })),
    );
    for (const r of failedResults) {
      if (r.card) {
        serverCards.push({ baseUrl: r.baseUrl, card: r.card });
      } else {
        failedUrls.push(r.baseUrl);
        steps.push({
          type: "thinking",
          content: `⚠ Could not reach ${r.baseUrl} — server may be down or the URL in the config is stale.`,
        });
      }
    }
    if (failedUrls.length > 0) {
      steps.push({
        type: "thinking",
        content: `Proceeding with ${serverCards.length} reachable server(s). ${failedUrls.length} server(s) skipped.`,
      });
    }
  } else {
    // Stages 3 + 4: ORD document reveals the server count and metadata.
    // Server Cards are fetched from the internal URLs the catalog-agent knows,
    // since public URLs (localhost:3001 etc.) don't resolve inside Docker.
    steps.push({
      type: "ord",
      content: `Reading ORD document at ${config.serverUrl}/ord/v1/documents/catalog`,
      url: `${config.serverUrl}/ord/v1/documents/catalog`,
    });

    const ordRes = await fetch(config.ordDocUrl);
    const ordDoc = await ordRes.json() as {
      apiResources?: Array<{ resourceDefinitions?: Array<{ type: string; url: string }> }>;
    };
    const cardDefs = (ordDoc.apiResources ?? [])
      .flatMap((api) => api.resourceDefinitions ?? [])
      .filter((def) => def.type === "sap:mcp-server-card:v0");

    steps.push({
      type: "thinking",
      content: `Found ${cardDefs.length} MCP Server Card references in ORD document. Fetching each Server Card...`,
    });

    // Use internal Docker URLs to fetch Server Cards — the ORD document's public
    // URLs (localhost:300x) don't resolve from inside the catalog-agent container.
    const fetchedCards = await Promise.all(
      config.ordSpaceshipUrls.map(async (internalUrl) => ({
        card: await fetchServerCard(internalUrl),
      })),
    );

    for (const { card } of fetchedCards) {
      if (card) serverCards.push({ baseUrl: card.remotes[0]?.url ?? "", card });
    }

    steps.push({
      type: "thinking",
      content: `Fetched ${serverCards.length} Server Cards. ${stage === 4 ? "Tool metadata available from cards — no live MCP connections needed yet." : "Connecting to each server for tools/list..."}`,
    });
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

      steps.push({ type: "tool_call", content: `tools/list`, server: serverTitle });

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

  // ─── STAGE 4: Pre-select relevant tools using Server Card descriptions ───────
  if (stage === 4 && claudeTools.length > 0) {
    const toolSummary = claudeTools.map((t) => `${t.name}: ${t.description}`).join('\n');

    steps.push({
      type: "thinking",
      content: `Pre-selecting relevant tools from ${claudeTools.length} available using Server Card descriptions...`,
    });

    const selectionRes = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      temperature: 0,
      system: "You are a tool selector. Given a user message and a list of tools with descriptions, return ONLY a JSON array of the tool names needed. No explanation, no markdown — just the JSON array.",
      messages: [{
        role: "user",
        content: `User message: "${userMessage}"\n\nAvailable tools:\n${toolSummary}`,
      }],
    });

    const selectionText = selectionRes.content.find((b) => b.type === "text")?.text ?? "[]";
    let selectedNames: string[] = [];
    try {
      const match = selectionText.match(/\[[\s\S]*\]/);
      selectedNames = match ? (JSON.parse(match[0]) as string[]) : [];
    } catch {
      selectedNames = [];
    }

    if (selectedNames.length > 0) {
      const totalBefore = claudeTools.length;
      claudeTools = claudeTools.filter((t) => selectedNames.includes(t.name));
      steps.push({
        type: "thinking",
        content: `Selected ${claudeTools.length} of ${totalBefore} tools: ${claudeTools.map((t) => t.name).join(', ')}`,
      });
    } else {
      steps.push({
        type: "thinking",
        content: `Pre-selection inconclusive — proceeding with all ${claudeTools.length} tools.`,
      });
    }
  }

  const failedNote = failedUrls.length > 0
    ? `\n\n[System note: The following servers from the hand-written config file could not be reached: ${failedUrls.join(', ')}. The URL in the config may be stale or outdated — this is a known risk of manually maintained configuration files. Mention this clearly in your response, framing it as a possible config issue rather than hardware damage.]`
    : '';

  const messages: Anthropic.Messages.MessageParam[] = [
    ...history.map((h) => ({ role: h.role as "user" | "assistant", content: h.content })),
    { role: "user", content: userMessage + failedNote },
  ];

  // ─── Agentic loop — identical for stages 2, 3, 4 ─────────────────────────
  while (true) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      temperature: 0,
      system: stage === 2 ? SYSTEM_STAGE2 : SYSTEM_WITH_TOOLS,
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
          content: block.name,
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

        steps.push({ type: "tool_result", content: resultText.slice(0, 120) + (resultText.length > 120 ? '…' : ''), tool: block.name, server: route.serverTitle });
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: resultText });
      }

      messages.push({ role: "user", content: toolResults });
    }
  }
}
