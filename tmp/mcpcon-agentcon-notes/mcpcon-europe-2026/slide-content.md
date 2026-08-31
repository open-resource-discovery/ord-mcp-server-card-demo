# MCPCon Amsterdam 2026 — Slide Content & Template Guide

**Talk:** MCP Discovery at Scale: Server Cards + Open Resource Discovery
**Speakers:** Vyshnavi Gadamsetti + Sebastian Wennemers
**Date:** September 17–18, 2026
**Duration:** 25 min
**Template:** NeoNephos / Linux Foundation (dark purple/blue gradient) — reference: `Open Resource Discovery - Presentation.pdf`

---

## Slides to REUSE from existing ORD presentation

These slides can be copied directly or with minor edits:

| Slide # in ORD PDF | Title | What to change |
| --- | --- | --- |
| 5 + 6 | "Every Domain / Protocol / Technology Has Its Own Discovery Protocol and Catalog" | Keep the fragmented → unified animation. No changes needed — MCP is already listed as a chip on the slide. |
| 7 + 8 + 9 | "Metadata Integration Without Aligned Standards" (tangled cables → same adapters → aggregator) | Relabel "Provider" → "MCP Server", "Consumer" → "Agent / Orchestrator / Registry". Complexity labels stay the same. |
| 12 | "What is ORD?" (hexagon diagram) | Keep as-is. Highlight the MCP entry on the right side. |
| 13 | "ORD Integration Architecture" (aggregator with static/runtime) | Keep as-is. This is exactly the architecture the demo runs. |
| 14 | "Agents & MCP Servers Are Now First-Class Citizens" | Keep as-is. Directly relevant. |
| 18 | "Open. Neutral. Community-Owned." (NeoNephos Foundation + TSC) | Keep as-is. Sebastian Wennemers is already listed as TSC member — strong credibility signal. Add mention that MCP Server Card spec and demo repo are open-source under open-resource-discovery org. |

---

## Slides to CREATE NEW (in the same visual style)

### Slide 1 — Title
**Layout:** Title slide (same as PDF slide 1)
- **Title:** From API Catalogs To Agent Catalogs: Solving MCP Server Discovery With Open Resource Discovery
- **Subtitle:** Friday, September 18 · 12:40 CEST · Emerald Room
- **Speakers:** Vyshnavi Gadamsetti, Central Architect, SAP · Sebastian Wennemers, Principal Engineer, SAP
- **Date:** September 18, 2026

---

### Slide 2 — The Scale Problem
**Layout:** Stats grid (same as PDF slide 2 "What is SAP?")
- **Title:** The MCP Ecosystem Is Growing Fast
- **Stats:**
  - 100,000+ MCP servers indexed on public registries
  - No standard way to discover them without connecting
  - Every orchestrator builds its own catalog — out of band
  - tools/list requires a live session — no auth-free introspection
  - Registries, portals, gateways all face the same gap

---

### Slide 3 — Section Divider
**Layout:** Section divider (same as PDF slide 3)
> UNDERSTANDING THE DISCOVERY GAP

---

### Slide 4 — How Discovery Works Today
**Layout:** Two-column content slide
- **Title:** How an Agent Discovers MCP Tools Today
- **Left column — "What the spec says":**
  - Connect to server
  - Call tools/list
  - Get the list
  - Act
- **Right column — "What that costs":**
  - One live connection per server before you know if it's relevant
  - Auth required — no unauthenticated path
  - Result varies by caller, session, RBAC
  - Cache it yourself, with a borrowed identity. It drifts.
- **Speaker note:** "Works fine for one server. What about 50? What about a gateway fronting 1,100?"

---

### Slide 5 — Section Divider
**Layout:** Section divider
> THE SOLUTION: MCP SERVER CARD + ORD

---

### Slide 6 — What is a Server Card?
**Layout:** Large centered block + three columns below
- **Title:** Meet the MCP Server Card
- **Large block:** `GET /.well-known/mcp-server-card.json`
- **Three columns:**
  - Identity: name, title, version, description, tags
  - Remote endpoint: remotes[].url → the MCP URL to connect to
  - Tool metadata (optional): tools[] — name, description, inputSchema, annotations
- **Caption:** No session. No auth. Readable before you connect. Analogous to OpenAPI for REST.

---

### Slide 7 — What ORD Adds
**Layout:** Two-phase animation (same style as slides 5+6 in ORD PDF)
- **Title:** ORD Turns Isolated Cards into a Catalog
- **Phase 1:** Each MCP server exposes a Server Card. No shared index. (fragmented visual)
- **Phase 2:** ORD document at /.well-known/open-resource-discovery links to all Server Cards. One URL → machine-readable catalog of the entire fleet. (unified visual)
- **Caption:** "ORD is the shared discovery protocol. Server Card is the per-server description. Together they're O(1) — read the catalog, get everything."

---

### Slide 8 — Section Divider
**Layout:** Section divider (same as PDF slide 15)
> DEMO
>
> Live: ORD catalog · Server Card · Agent with and without tool metadata

---

### Slide 9 — What's in the Server Card (post-demo)
**Layout:** Left JSON + right bullets
- **Title:** Server Card — What the Agent Reads
- **Left:** JSON snippet from the demo (thruster-control card with tools[])
- **Right:** What each field enables
  - remotes[] → where to connect at runtime
  - tools[].description → agent routing without connecting
  - annotations.destructiveHint → gateway policy, human approval gates
  - inputSchema → Arazzo pre-execution validation, codegen

---

### Slide 10 — What Consumers Get
**Layout:** Four-column card layout (same style as PDF slide 17 "Building an Ecosystem")
- **Title:** What Consumers Get From Static Tool Metadata
- **Card 1 — Agent Orchestrator:** Routes at plan time. No discovery round-trips. Full tool catalog before the first API call.
- **Card 2 — Registry / Developer Portal:** Shows what a server offers without connecting. No borrowed identity, no stale cache.
- **Card 3 — Security Review:** Audits tool surface from the card. destructiveHint, requiredScopes — policy without live access.
- **Card 4 — Arazzo / Workflow:** Validates MCP tool use before execution. Same model as OpenAPI sourceDescriptions.

---

### Slide 11 — Community Momentum (GitHub issue #30)
**Layout:** Pull quotes / checklist cards (same style as PDF slide 19 "ORD Takeaways")
- **Title:** The Community Is Asking for This
- **Opening quote:** "Without tool definitions in the card, the card doesn't really tell you what a server does." — GitHub issue #30, ext-server-card
- **Three callout cards:**
  - S-Reagan (gateway operator): "A server should be able to say 'I have tools, they're dynamic, fetch them at runtime' as a distinct signal."
  - christophercolumbusdog (internal gateway): "Everyone builds their own catalog anyway — out of band, under whatever identity happened to be available."
  - frankkilcommins (Arazzo spec): "Declarative tool advertisement would enable Arazzo sourceDescriptions for MCP — pre-execution validation."
- **Bottom:** Issue #30 open at github.com/modelcontextprotocol/ext-server-card · SEP-2127 submitted

---

### Slide 12 — Takeaways
**Layout:** Checklist cards (same as PDF slide 19)
- **Title:** What to Take Away
- MCP servers are discoverable today via Server Card + ORD — one URL, no session
- Tool metadata in the card is optional but high-value — agents, registries, and gateways all benefit
- tools/list stays the runtime source of truth — the card is for discovery, not execution
- The pattern is proven: OpenAPI did this for REST. Server Card does it for MCP.
- The spec needs operator feedback — if you run a gateway or registry, your input on issue #30 matters

---

### Slide 13 — Call to Action / Links
**Layout:** QR code cards (same as PDF slide 20/21)
- **Title:** Try It · Contribute · Connect
- **Card 1:** Demo repo — github.com/open-resource-discovery/ord-mcp-server-card-demo · `docker compose up`
- **Card 2:** MCP Server Card playground — open-resource-discovery.github.io/mcp-server-card-ui/playground/
- **Card 3:** GitHub issue #30 — github.com/modelcontextprotocol/ext-server-card/issues/30

---

## Full slide order

| # | Title | Source |
| --- | --- | --- |
| 1 | Title slide | NEW |
| 2 | The MCP Ecosystem Is Growing Fast | NEW |
| 3 | Section: Understanding the Discovery Gap | NEW |
| 4 | How an Agent Discovers MCP Tools Today | NEW |
| 5 | Every Domain Has Its Own Discovery Protocol (fragmented) | REUSE PDF slide 5 |
| 6 | Every Domain Has Its Own Discovery Protocol (unified) | REUSE PDF slide 6 |
| 7 | Metadata Integration Without Aligned Standards (tangled) | REUSE PDF slide 7 |
| 8 | Metadata Integration Without Aligned Standards (same adapters) | REUSE PDF slide 8 |
| 9 | Metadata Integration Without Aligned Standards (aggregator) | REUSE PDF slide 9 |
| 10 | Section: The Solution: MCP Server Card + ORD | NEW |
| 11 | Meet the MCP Server Card | NEW |
| 12 | ORD Turns Isolated Cards into a Catalog | NEW |
| 13 | What is ORD? (hexagon diagram) | REUSE PDF slide 12 |
| 14 | ORD Integration Architecture | REUSE PDF slide 13 |
| 15 | Agents & MCP Servers Are Now First-Class Citizens | REUSE PDF slide 14 |
| 16 | Section: DEMO | NEW |
| 17 | Server Card — What the Agent Reads | NEW |
| 18 | What Consumers Get From Static Tool Metadata | NEW |
| 19 | The Community Is Asking for This (issue #30) | NEW |
| 20 | Open. Neutral. Community-Owned. (NeoNephos) | REUSE PDF slide 18 |
| 21 | What to Take Away | NEW |
| 22 | Try It · Contribute · Connect | NEW |

---

## Speaker split suggestion

| Slides | Speaker |
| --- | --- |
| 1–9 (problem + scale) | Sebastian |
| 10–16 (solution + demo) | Vyshnavi |
| 17–22 (deep dive + community + CTA) | Both |
