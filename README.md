# ORD MCP Server Card Demo

A live demonstration of [MCP Server Cards](https://github.com/modelcontextprotocol/ext-server-card) combined with [Open Resource Discovery (ORD)](https://open-resource-discovery.org) for agent-driven tool discovery — built for MCPCon Amsterdam 2026.

The demo walks through four progressive stages of MCP server discovery, showing an AI agent solving spaceship emergencies at each stage. The progression makes visible exactly what ORD and Server Card tool metadata buy you — and what the cost is without them.

---

## What it demonstrates

Four stages, each selectable from the UI:

| Stage | Server source | Tool source | What it shows |
| --- | --- | --- | --- |
| **1 — No MCP** | — | None | Claude can only reason, not act. No tools, no MCP. |
| **2 — Config + tools/list** | Env config (manual) | `tools/list` at runtime | How MCP is used today. Works, but someone wrote that URL list by hand. |
| **3 — ORD + tools/list** | ORD document (servers self-describe) | `tools/list` at runtime | Ownership of the server list shifts to the provider. Still needs live connections for tools. |
| **4 — ORD + Server Card** | ORD document | `tools[]` in the card | Tool catalog built from static metadata. Zero connections before the first tool call. |

The key transitions:

- **Stage 2 → 3**: who maintains the server list shifts from a consumer config file to provider self-description via ORD
- **Stage 3 → 4**: who maintains the tool catalog shifts from runtime `tools/list` to static `tools[]` in the Server Card

The point: tool metadata in the Server Card lets an agent, registry, or orchestrator know what a server does **before connecting** — the same way OpenAPI lets you understand an API before calling it.

---

## Architecture

```mermaid
graph TD
    Browser["Browser\n(localhost:3005)"]
    Agent["Super Agent\n(catalog-agent :3005)\n• Serves UI + ORD document\n• Runs agentic loop\n• Routes tool calls"]
    Claude["Claude API\n(via HAI proxy)"]
    ORD["ORD Document\n/ord/v1/documents/catalog"]
    T["Thruster Control\n(:3001)"]
    N["Navigation\n(:3002)"]
    LS["Life Support\n(:3003)"]
    C["Comms Relay\n(:3004)"]

    Browser -->|"POST /api/chat"| Agent
    Agent -->|"reads"| ORD
    Agent -->|"fetch Server Card\n/.well-known/mcp-server-card.json"| T
    Agent -->|"fetch Server Card"| N
    Agent -->|"fetch Server Card"| LS
    Agent -->|"fetch Server Card"| C
    Agent -->|"claude-sonnet-4-6\ntool use loop"| Claude
    Agent -->|"MCP tool calls\n(Streamable HTTP)"| T
    Agent -->|"MCP tool calls"| N
    Agent -->|"MCP tool calls"| LS
    Agent -->|"MCP tool calls"| C
```

---

## Discovery flow

### Stage 3 — ORD + tools/list

```mermaid
sequenceDiagram
    participant Agent
    participant ORD as ORD Document
    participant SC as Server Cards (×4)
    participant MCP as MCP Servers (×4)
    participant Claude

    Agent->>ORD: GET /ord/v1/documents/catalog
    ORD-->>Agent: apiResources[].resourceDefinitions[type=mcp-server-card]
    loop for each server
        Agent->>SC: GET /.well-known/mcp-server-card.json
        SC-->>Agent: { name, remotes[], (no tools) }
        Agent->>MCP: connect + tools/list
        MCP-->>Agent: tools[] (live round-trip)
    end
    Agent->>Claude: messages + full tool catalog
    loop agentic loop
        Claude-->>Agent: tool_use
        Agent->>MCP: callTool(name, args)
        MCP-->>Agent: result
        Agent->>Claude: tool_result
    end
    Claude-->>Agent: end_turn → answer
```

### Stage 4 — ORD + Server Card tool metadata

```mermaid
sequenceDiagram
    participant Agent
    participant ORD as ORD Document
    participant SC as Server Cards (×4)
    participant Claude
    participant MCP as MCP Servers

    Agent->>ORD: GET /ord/v1/documents/catalog
    ORD-->>Agent: apiResources[].resourceDefinitions[type=mcp-server-card]
    loop for each server
        Agent->>SC: GET /.well-known/mcp-server-card.json
        SC-->>Agent: { name, remotes[], tools[] }
    end
    Note over Agent: Tool catalog built from card — no live connections
    Agent->>Claude: messages + full tool catalog
    loop agentic loop
        Claude-->>Agent: tool_use
        Agent->>MCP: callTool(name, args)
        MCP-->>Agent: result
        Agent->>Claude: tool_result
    end
    Claude-->>Agent: end_turn → answer
```

---

## The four MCP servers

Each server simulates a spaceship subsystem with three tools:

| Server | Port | Tools |
| --- | --- | --- |
| **Thruster Control** | 3001 | `check_thruster_status`, `adjust_thrust_level`, `emergency_shutdown` |
| **Navigation** | 3002 | `get_current_position`, `plot_course`, `check_eta` |
| **Life Support** | 3003 | `get_life_support_status`, `adjust_oxygen_level`, `vent_co2` |
| **Comms Relay** | 3004 | `check_signal_strength`, `scan_frequencies`, `send_distress_signal` |

All four expose a Server Card at `/.well-known/mcp-server-card.json` and an MCP endpoint at `/mcp`.
The ORD document at `http://localhost:3005/ord/v1/documents/catalog` links to all four cards.

---

## Running the demo

### Prerequisites

- Docker Desktop
- An Anthropic API key (or SAP HAI proxy token)

### Start

```powershell
# Set your API key
$env:ANTHROPIC_AUTH_TOKEN = "your-key-here"

# Build and start all containers
cd demo
docker compose build --no-cache
docker compose up
```

Open **[http://localhost:3005](http://localhost:3005)** in your browser.

### Restart after changes

```powershell
docker compose down
docker compose build --no-cache
docker compose up
```

### ORD document

Browse the machine-readable service catalog at:
**[http://localhost:3005/ord/v1/documents/catalog](http://localhost:3005/ord/v1/documents/catalog)**

Individual server cards:

- [localhost:3001/.well-known/mcp-server-card.json](http://localhost:3001/.well-known/mcp-server-card.json)
- [localhost:3002/.well-known/mcp-server-card.json](http://localhost:3002/.well-known/mcp-server-card.json)
- [localhost:3003/.well-known/mcp-server-card.json](http://localhost:3003/.well-known/mcp-server-card.json)
- [localhost:3004/.well-known/mcp-server-card.json](http://localhost:3004/.well-known/mcp-server-card.json)

---

## Demo scenarios

The UI includes seven pre-built scenarios that exercise different subsets of the server fleet:

| Scenario | Servers involved |
| --- | --- |
| Thruster overheating | Thruster Control |
| CO2 critical | Life Support |
| Depart to Mars | Navigation + Thruster Control |
| Contact lost + thrusters failing | Comms Relay + Thruster Control |
| Crew safety check | Life Support + Comms Relay |
| Mission readiness | Navigation + Life Support + Thruster Control |
| Full system check | All four servers |

Multi-server scenarios are where the discovery overhead difference is most visible: the left panel must make 4 sequential `tools/list` calls before Claude sees a single tool, while the right panel starts immediately.

---

## Project structure

```text
ord-mcp-server-card-demo/
├── spaceship-app/          # Single Node.js app, runs as 4 MCP servers
│   └── src/
│       ├── servers/        # thruster.ts, navigation.ts, lifeSupport.ts, comms.ts
│       └── shared/         # createServer.ts — ORD + Server Card + MCP endpoint
├── super-agent/            # Catalog agent: UI, ORD router, agent logic
│   └── src/
│       ├── agent.ts        # Two-mode discovery + agentic loop
│       ├── catalog.ts      # ServerCard fetch + type
│       ├── config.ts       # Env config (ports, URLs, API key)
│       ├── ordRouter.ts    # ORD well-known + catalog document endpoints
│       └── ui.ts           # Single-file HTML/CSS/JS demo UI
└── demo/
    └── docker-compose.yml  # 5 containers: 4 spaceship servers + catalog-agent
```

---

## Key concepts

**MCP Server Card** — A static JSON document at `/.well-known/mcp-server-card.json` that describes an MCP server: its identity, remote endpoints, and optionally its tools. Analogous to an OpenAPI document for REST APIs. Defined in [`modelcontextprotocol/ext-server-card`](https://github.com/modelcontextprotocol/ext-server-card).

**Open Resource Discovery (ORD)** — A protocol for machine-readable self-description of system resources. Here the Super Agent publishes an ORD document listing all four spaceship servers as `apiResources`, each with a `resourceDefinitions` entry pointing to its Server Card. Spec: [open-resource-discovery.org](https://open-resource-discovery.org).

**Streamable HTTP transport** — The MCP transport used for all tool calls in this demo. Each call creates a fresh connection; no persistent session.

---

## Related

- [MCP Server Card spec](https://github.com/modelcontextprotocol/ext-server-card)
- [GitHub issue #30 — Add optional tool metadata to Server Card](https://github.com/modelcontextprotocol/ext-server-card/issues/30)
- [Open Resource Discovery specification](https://open-resource-discovery.org)
- [MCP Server Card UI playground](https://open-resource-discovery.github.io/mcp-server-card-ui/playground/)
