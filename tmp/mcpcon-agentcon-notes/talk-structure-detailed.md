# Talk Structure — Detailed Breakdown

**Title**: From API Catalogs To Agent Catalogs: Solving MCP Server Discovery With Open Resource Discovery
**Slot**: 25 min — Friday Sept 18, 12:40–13:05, Emerald Room

---

## Segment 1 — Hook (2 min)

**Opening line**: "You're building a gateway for MCP servers. You have a thousand of them. How do you know what's there?"

**What you say**:

- MCP servers are multiplying fast — every team, every product is shipping one
- Today, the only way to know what a server can do is to connect to it, start a session, and ask
- That works fine for one server. It does not work for a registry, a catalog, or a gateway that needs to reason about thousands

**Goal**: Get the audience to feel the problem before you name it. Anyone who has built a registry or a gateway will immediately nod.

---

## Segment 2 — Problem: No Standard Description Format (3 min)

**What you say**:

- MCP's `tools/list`, `resources/list`, `prompts/list` are live calls — they require an active session
- Every server is a point-to-point integration: you have to start it, connect to it, authenticate, then ask what it does
- There is no standard way to describe an MCP server at rest — no shared format, no well-known endpoint, nothing a registry or gateway can crawl
- This is the same problem APIs had before OpenAPI

**What you show** (optional): A simple diagram — 5 MCP servers, 5 separate connection arrows, no shared catalog layer.

**Goal**: Land the analogy to the pre-OpenAPI era. The audience will recognise this pattern immediately.

---

## Segment 3 — OpenAPI Solved This for APIs. Server Card Does It for MCP. (4 min)

**What you say**:

- Before OpenAPI, every API was a point-to-point integration — you had to read docs or connect to know what it did
- OpenAPI gave APIs a standard, static, machine-readable description. Tooling exploded: generators, validators, gateways, registries — all built on that one format
- MCP servers need the same thing. That is what a Server Card is.
- A Server Card is a static JSON document at `/.well-known/mcp-server-card.json` — it describes the server's tools, resources, and prompts without requiring a live session
- The MCP community has a minimal version. We went further.

**Key point to land**: OpenAPI is the analogy, not just a reference. The audience already knows what OpenAPI unlocked for APIs — Server Card unlocks the same for MCP.

---

## Segment 4 — The Server Card: Richer Than Minimal + Playground Demo (6 min)

**What you say**:

- The minimal community Server Card gives you name, version, and a list of capabilities — a starting point
- Our Server Card goes further: transport details, protocol versions, ownership metadata, tags, ORD-compatible structure
- Why does that matter? Because registries, gateways, and catalogs need more than a capability list — they need enough context to reason about a server without connecting to it
- Let me show you what a Server Card looks like

**What you show** (live — playground):

1. Open `open-resource-discovery.github.io/mcp-server-card-ui/playground/`
2. Point to the left sidebar — "these are servers described by their Server Cards"
3. Click one — show the Overview: name, version, transport, protocol, capabilities, tools, resources, prompts
4. Point to the JSON in the middle — "this is the `/.well-known/mcp-server-card.json` endpoint — static, no session needed"
5. Highlight a tool — show the annotations (read-only, idempotent) — "this is what the minimal spec does not have"

**Goal**: Audience sees the Server Card format and the richness that goes beyond the minimal community version. The playground makes it tangible.

---

## Segment 5 — ORD as the Aggregation Layer: Spaceship Demo (7 min)

**What you say**:

- A Server Card on its own is powerful. But what happens when you have many servers?
- This is where ORD comes in — not as the solution to the description problem, but as the aggregation layer on top of it
- ORD already does this for APIs: aggregators crawl OpenAPI specs at well-known endpoints and build catalogs
- The same pattern works for Server Cards. Let me show you.

**What you show** (live — spaceship demo):

1. A spaceship system — each component (thruster control, navigation, life support, comms relay) is a separate MCP server
2. Each server exposes a Server Card at `/.well-known/mcp-server-card.json`
3. Run the ORD aggregator — it crawls each card without starting a single MCP session
4. Switch to the playground sidebar — all spaceship servers appear in the list
5. Click through two or three — each shows its full Server Card
6. "No MCP session. No `tools/list` call. The aggregator just read the card."

**Key moment**: Show the catalog (playground sidebar) side by side with the running servers. Before: isolated servers. After: a catalog. No live connections needed.

**Goal**: ORD is the aggregation infrastructure — not the hero, but the layer that makes Server Cards composable across a whole system.

---

## Segment 6 — SEP-2127 + Call to Action (3 min)

**What you say**:

- The Server Card schema and the `/.well-known` discovery mechanism are live proposals to the MCP community via SEP-2127
- The playground, the schema, and this demo repo are open community — available now
- OpenAPI took years to become the standard because the community converged on it together
- Server Card can move faster — the pattern is proven, the tooling exists, the community is here

**Call to action**:

- If you build MCP servers: add a Server Card endpoint today
- If you build registries or gateways: start reading Server Cards before connecting
- If you want to shape the standard: comment on SEP-2127

**Links to show**:

- SEP-2127 (MCP community proposal)
- `open-resource-discovery.github.io/mcp-server-card-ui/playground/`
- Demo repo (agentcon-mcpcon-demo)
- Schema: `mcp-server-card.schema.yaml`

---

## Narrative Arc Summary

```text description format for MCP servers
   ↓
Analogy: OpenAPI solved this for APIs
   ↓
Solution: Server Card — static description at a well-known endpoint
   ↓
Richer: Our Server Card goes beyond the minimal community version
   ↓
At scale: ORD aggregates Server Cards into catalogs (spaceship demo)
   ↓
Call to action: SEP-2127 is live — converge on it together
```

---

## Speaker Split (to discuss with Sebastian)

| Segment | Proposed Owner |
| --- | --- |
| Hook + Problem | Vyshnavi |
| OpenAPI analogy + Server Card intro | Vyshnavi |
| Playground demo | Vyshnavi |
| Spaceship demo (ORD aggregation) | Sebastian |
| SEP-2127 + call to action | Both |

Rationale: Vyshnavi owns the narrative, the analogy, and the spec context. Sebastian owns the demo he built. Handoff happens at the live spaceship demo — clean split.
