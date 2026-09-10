# ORD MCP Server Card Demo

A live demonstration of [MCP Server Cards](https://github.com/modelcontextprotocol/ext-server-card) combined with [Open Resource Discovery (ORD)](https://open-resource-discovery.org) for agent-driven tool discovery — built for AGNTCon + MCPCon Europe 2026, Amsterdam.

The demo walks through four progressive stages of MCP server discovery, showing an AI agent (MITRA) solving spaceship emergencies at each stage. The progression makes visible exactly what ORD and Server Card tool metadata buy you — and what the cost is without them.

---

## Quick start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- An Anthropic API key — get one at [console.anthropic.com](https://console.anthropic.com)

### Clone and run

```bash
git clone https://github.com/open-resource-discovery/ord-mcp-server-card-demo.git
cd ord-mcp-server-card-demo/demo
```

**macOS / Linux:**
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
docker compose build --no-cache
docker compose up
```

**Windows (PowerShell):**
```powershell
$env:ANTHROPIC_API_KEY = "sk-ant-..."
docker compose build --no-cache
docker compose up
```

Open **[http://localhost:3005](http://localhost:3005)** in your browser.

> **SAP employees:** Set `ANTHROPIC_AUTH_TOKEN` (HAI proxy token) instead of `ANTHROPIC_API_KEY`, and ensure the HAI proxy is running locally on port 6655.

### Rebuild after code changes

```bash
docker compose down
docker compose build --no-cache
docker compose up
```

To rebuild only the catalog agent (UI / agent logic changes):

```bash
docker compose build --no-cache catalog-agent
docker compose up catalog-agent
```

---

## What it demonstrates

Four stages, selectable from the UI:

| Stage | Server source | Tool source | What it shows |
|---|---|---|---|
| **1 — No MCP** | — | None | MITRA can only reason, not act. No tools, no MCP. |
| **2 — Manual config** | Hand-written `mcp-servers.json` | `tools/list` at runtime | How MCP is configured today — someone maintains the URL list by hand. |
| **3 — ORD + tools/list** | ORD document (servers self-describe) | `tools/list` at runtime | Ownership of the server list shifts to the provider. Still needs live connections for tools. |
| **4 — ORD + Server Card** | ORD document | `tools[]` embedded in Server Card | Tool catalog from static metadata. Zero connections before the first tool call. Pre-selection enabled. |

Key transitions:

- **Stage 2 → 3**: who maintains the server list shifts from a consumer config file to provider self-description via ORD
- **Stage 3 → 4**: who maintains the tool catalog shifts from runtime `tools/list` to static `tools[]` in the Server Card — enabling pre-selection before connecting

---

## Stage 2 — The broken comms scenario

In Stage 2 the comms server has been **renamed** from `comms` to `communication` — but nobody updated the config file. The agent tries the old address, fails, and reports it.

Switch to Stage 3 or 4: ORD has the current address, the agent reaches it without any config change.

To inspect the config file: open [`demo/mcp-servers.json`](demo/mcp-servers.json).  
Full server documentation: [`demo/mcp-server-registry.md`](demo/mcp-server-registry.md).

---

## Stage 4 — Tool pre-selection

In Stage 4 the agent makes an extra lightweight Claude call before the main agentic loop:

1. Reads Server Cards from ORD (no server connections)
2. Sends tool names + descriptions to Claude: *"which tools are needed for this request?"*
3. Filters to only the selected tools
4. Runs the main agentic loop with the reduced tool set

This is only possible in Stage 4 because tool descriptions are available upfront from the Server Card — without connecting to any server.

---

## The seven spaceship servers

| Server | Port | Tools |
|---|---|---|
| **Thruster Control** | 3001 | `check_thruster_status`, `adjust_thrust_level`, `emergency_shutdown` |
| **Navigation** | 3002 | `get_current_position`, `plot_course`, `check_eta` |
| **Life Support** | 3003 | `get_life_support_status`, `adjust_oxygen_level`, `vent_co2` |
| **Communication** | 3004 | `check_signal_strength`, `scan_frequencies`, `send_distress_signal` |
| **Damage Control** | 3006 | `assess_hull_damage`, `seal_hull_breach`, `close_emergency_bulkhead` |
| **Oxygen Scrubber** | 3007 | `get_scrubber_status`, `activate_backup_scrubbers`, `tap_oxygen_reserve` |
| **Entertainment** | 3008 | `play_music`, `stream_movie`, `set_cabin_lighting` |

All servers expose:
- A Server Card at `/.well-known/mcp/server-card`
- An MCP endpoint at `/mcp`
- An ORD document at `/.well-known/open-resource-discovery`

Stage 2 config includes only Thruster, Navigation, Life Support, and Communication (old URL). Stages 3 and 4 discover all seven via ORD.

---

## Architecture

```
Browser (localhost:3005)
    │
    │ POST /api/chat
    ▼
Catalog Agent (:3005)
    ├── Serves demo UI
    ├── Publishes ORD document
    ├── Runs 4-stage agentic loop
    └── Routes MCP tool calls
         │
         ├── Stage 2: reads mcp-servers.json → connects to 4 servers
         ├── Stage 3: reads ORD → connects to 7 servers for tools/list
         └── Stage 4: reads ORD + Server Cards → connects only when tool is called
                  │
                  ▼
         Claude API (claude-sonnet-4-6)
```

---

## Project structure

```
ord-mcp-server-card-demo/
├── spaceship-app/              # Single Node.js app, deployed as 7 MCP servers
│   └── src/
│       ├── servers/            # thruster.ts, navigation.ts, lifeSupport.ts,
│       │                       # comms.ts, damageControl.ts, oxygenScrubber.ts,
│       │                       # entertainment.ts
│       └── shared/             # createServer.ts — ORD + Server Card + MCP endpoint
├── super-agent/                # Catalog agent: UI, ORD router, agent logic
│   └── src/
│       ├── agent.ts            # 4-stage discovery + agentic loop + pre-selection
│       ├── catalog.ts          # ServerCard fetch + type definitions
│       ├── config.ts           # Env config (ports, URLs, API key)
│       ├── ordRouter.ts        # ORD well-known + catalog document endpoints
│       ├── ui.ts               # Single-file HTML/CSS/JS demo UI
│       └── assets/             # Stage images (stage1–4.png, mitra.png)
└── demo/
    ├── docker-compose.yml      # 8 containers: 7 spaceship servers + catalog-agent
    ├── mcp-servers.json        # Stage 2 hand-written config (editable live)
    └── mcp-server-registry.md  # Human-readable server + tool catalog
```

---

## Useful endpoints (while running)

| URL | Description |
|---|---|
| [localhost:3005](http://localhost:3005) | Demo UI |
| [localhost:3005/ord/v1/documents/catalog](http://localhost:3005/ord/v1/documents/catalog) | ORD catalog document |
| [localhost:3005/api/catalog](http://localhost:3005/api/catalog) | Server Card summary (JSON) |
| [localhost:3001/.well-known/mcp/server-card](http://localhost:3001/.well-known/mcp/server-card) | Thruster Control Server Card |
| [localhost:3002/.well-known/mcp/server-card](http://localhost:3002/.well-known/mcp/server-card) | Navigation Server Card |
| [localhost:3003/.well-known/mcp/server-card](http://localhost:3003/.well-known/mcp/server-card) | Life Support Server Card |
| [localhost:3004/.well-known/mcp/server-card](http://localhost:3004/.well-known/mcp/server-card) | Communication Server Card |

---

## Key concepts

**MCP Server Card** — A static JSON document at `/.well-known/mcp/server-card` that describes an MCP server: its identity, remote endpoints, and optionally its full tool catalog. Analogous to an OpenAPI document for REST APIs. Defined in [`modelcontextprotocol/ext-server-card`](https://github.com/modelcontextprotocol/ext-server-card).

**Open Resource Discovery (ORD)** — A protocol for machine-readable self-description of system resources. The catalog agent publishes an ORD document listing all seven spaceship servers, each with a `resourceDefinitions` entry pointing to its Server Card. Spec: [open-resource-discovery.org](https://open-resource-discovery.org).

**Streamable HTTP transport** — The MCP transport used for all tool calls in this demo. Each call opens a fresh connection; no persistent session.

---

## Related

- [MCP Server Card spec](https://github.com/modelcontextprotocol/ext-server-card)
- [Open Resource Discovery specification](https://open-resource-discovery.org)
- [MCP Server Card UI playground](https://open-resource-discovery.github.io/mcp-server-card-ui/playground/)
