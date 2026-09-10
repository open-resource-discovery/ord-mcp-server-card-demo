# MCPCon Amsterdam 2026 — Slide Content (PPT-Ready)

**Talk:** From API Catalogs To Agent Catalogs: Solving MCP Server Discovery With Open Resource Discovery
**Speakers:** Vyshnavi Gadamsetti + Sebastian Wennemers, SAP SE
**Slot:** Friday September 18, 12:40–13:05 CEST · Emerald Room · 25 min
**Template:** NeoNephos / Linux Foundation (dark purple/blue gradient)

---

## Timing

| Segment | Slides | Time |
|---|---|---|
| Hook + Problem | 1–4 | 4 min |
| ORD reuse slides | 5–8 | 2 min |
| Solution: Server Card + ORD | 9–12 | 4 min |
| Live demo | 13 | 10 min |
| Post-demo + CTA | 14–17 | 4 min |
| Buffer | — | 1 min |
| **Total** | **17** | **25 min** |

---

## Speaker split

| Slides | Speaker |
|---|---|
| 1–8 (problem + ORD context) | Sebastian |
| 9–17 (solution + demo + CTA) | Vyshnavi |

---

## Slide-by-slide content

---

### Slide 1 — Title
**Source:** NEW · Layout: Title slide

**Title (large):**
> From API Catalogs To Agent Catalogs

**Subtitle:**
> Solving MCP Server Discovery With Open Resource Discovery

**Speaker line:**
> Vyshnavi Gadamsetti · Sebastian Wennemers · SAP SE

**Event line:**
> MCPCon Europe · Amsterdam · September 18, 2026

---

### Slide 2 — The Scale Problem
**Source:** NEW · Layout: Stats grid

**Title:**
> The MCP Ecosystem Is Growing Fast

**Stats (large numbers, one per cell):**
- `100,000+` — MCP servers indexed on public registries
- `0` — standard ways to describe a server without connecting
- `N` — live connections a gateway needs before it knows what any server does
- `∞` — out-of-band catalogs teams are building on borrowed identity

**Speaker note:**
> "Every registry, every gateway, every orchestrator is solving the same problem independently. This is what fragmentation looks like before a standard emerges."

---

### Slide 3 — Section Divider
**Source:** NEW · Layout: Section divider (same style as ORD PDF)

**Big text:**
> UNDERSTANDING THE DISCOVERY GAP

---

### Slide 4 — How Discovery Works Today
**Source:** NEW · Layout: Two-column content

**Title:**
> How an Agent Discovers MCP Tools Today

**Left column — "What the spec says":**
1. Open a session
2. Authenticate
3. Call `tools/list`
4. Get the tool list
5. Repeat for every server

**Right column — "What that costs":**
- One live connection per server — before you know if it's relevant
- Auth required — no unauthenticated introspection path
- Result varies by caller, session, RBAC
- N servers = N round-trips before Claude sees a single tool

**Speaker note:**
> "This works fine for one server. What about a gateway fronting 1,000? You have to start each one, connect, authenticate, ask — just to build a catalog. And the catalog drifts the moment you stop."

---

### Slide 5 — Fragmentation (REUSE)
**Source:** REUSE — PDF slide 5
> "Every Domain / Protocol / Technology Has Its Own Discovery Protocol and Catalog" (fragmented state)

Copy as-is. MCP chip is already present on this slide.

---

### Slide 6 — Unified Discovery (REUSE)
**Source:** REUSE — PDF slide 6
> Same slide, unified/converged animation state

Copy as-is.

---

### Slide 7 — ORD Integration Architecture (REUSE)
**Source:** REUSE — PDF slide 13
> "ORD Integration Architecture" — aggregator with static/runtime split

Copy as-is. This diagram is the exact architecture the spaceship demo runs.

---

### Slide 8 — Agents & MCP First-Class (REUSE)
**Source:** REUSE — PDF slide 14
> "Agents & MCP Servers Are Now First-Class Citizens"

Copy as-is. Highlight the MCP entry if possible.

---

### Slide 9 — Section Divider
**Source:** NEW · Layout: Section divider

**Big text:**
> THE SOLUTION

**Smaller text below:**
> MCP Server Card + Open Resource Discovery

---

### Slide 10 — Meet the MCP Server Card
**Source:** NEW · Layout: Left JSON block + right annotation column

**Title:**
> Meet the MCP Server Card

**Left block — JSON (use monospace font, syntax-highlighted if possible):**
```json
GET /.well-known/mcp-server-card.json

{
  "name": "spaceship.demo/thruster-control",
  "title": "Thruster Control",
  "remotes": [{
    "type": "streamable-http",
    "url": "http://localhost:3001/mcp"
  }],
  "tools": [
    {
      "name": "check_thruster_status",
      "description": "Check thruster temperature and power level",
      "annotations": { "readOnlyHint": true }
    },
    {
      "name": "adjust_thrust_level",
      "description": "Adjust thruster power level from 0 to 100%",
      "annotations": { "idempotentHint": true },
      "inputSchema": {
        "properties": { "power_level": { "type": "number" } }
      }
    },
    {
      "name": "emergency_shutdown",
      "description": "Emergency shutdown of all thruster systems",
      "annotations": { "destructiveHint": true }
    }
  ]
}
```

**Right column — three annotation callouts:**
- `remotes[]` → where to connect at runtime — the MCP endpoint
- `tools[].description` → agent routing without connecting
- `annotations` → gateway policy, human approval gates (`destructiveHint`)

**Caption (bottom):**
> No session. No auth. Static. Readable before you connect.
> Analogous to OpenAPI for REST.

**Speaker note:**
> "This file sits at a well-known URL on every spaceship server. A registry can crawl it at any time — no session, no authentication. The annotations tell a gateway whether a tool needs human approval before execution. None of this requires calling tools/list."

---

### Slide 11 — ORD as the Aggregation Layer
**Source:** NEW · Layout: Two-phase diagram

**Title:**
> ORD Turns Isolated Cards into a Catalog

**Phase 1 — Before (left half):**
> Four server icons (Thruster, Navigation, Life Support, Comms Relay), each with a small card icon. No connection between them. Label: "4 Server Cards. No shared index."

**Phase 2 — After (right half):**
> Same four server icons, each pointing to a single ORD document node. Label: "One ORD document. One URL. Machine-readable catalog of the entire fleet."

**Caption:**
> `GET /.well-known/open-resource-discovery` → ORD document → `resourceDefinitions` → Server Cards
> Pull-based. Crawlable. No live sessions needed.

**Speaker note:**
> "ORD is not dynamic discovery — it's standardized self-description. The provider publishes a document that says 'here are my servers, here are their cards'. An aggregator or agent reads that one document and gets the whole fleet. This is the same mechanism ORD already uses for APIs and data products."

---

### Slide 12 — Open. Neutral. Community-Owned. (REUSE)
**Source:** REUSE — PDF slide 18
> "Open. Neutral. Community-Owned." — NeoNephos Foundation + TSC

Copy as-is. Sebastian Wennemers is listed as TSC member — leave that visible.

**Add to speaker notes or slide footer:**
> MCP Server Card spec and this demo repo are open-source under the open-resource-discovery GitHub org.

---

### Slide 13 — Demo Divider
**Source:** NEW · Layout: Section divider + table

**Big text:**
> DEMO

**Smaller text:**
> A spaceship in four emergencies — four stages of discovery

**Table below (readable on the slide):**

| Stage | Who owns the server list | Who owns the tool catalog |
|---|---|---|
| 1 — No MCP | — | — |
| 2 — Config + tools/list | Consumer (env config) | Runtime tools/list |
| 3 — ORD + tools/list | Provider (ORD document) | Runtime tools/list |
| 4 — ORD + Server Card | Provider (ORD document) | Provider (card tools[]) |

**Speaker note:**
> "We'll run the same emergency scenario through all four stages. Watch what changes in the step panel on the right — specifically how many connections happen before Claude sees its first tool."

---

### Slide 14 — What Static Metadata Unlocks
**Source:** NEW · Layout: Four-column card grid

**Title:**
> What Static Tool Metadata Unlocks

**Card 1 — Agent Orchestrator:**
> Full tool catalog at plan time.
> No discovery round-trips before the first tool call.
> Works even if servers are temporarily offline.

**Card 2 — Registry / Developer Portal:**
> Shows what a server offers without connecting.
> No borrowed identity. No stale cache.
> Indexable by web crawlers.

**Card 3 — Security / Governance:**
> Audit tool surface from the card.
> `destructiveHint` → flag for human approval.
> Policy enforcement without live access.

**Card 4 — Workflow Automation (Arazzo):**
> Declarative tool advertisement.
> Enables Arazzo `sourceDescriptions` for MCP.
> Pre-execution validation before the agent runs.

---

### Slide 15 — Community Momentum
**Source:** NEW · Layout: Quote + three callout cards

**Title:**
> The Community Is Already Asking for This

**Opening quote (large, centered):**
> "Without tool definitions in the card, the card doesn't really tell you what a server does."
> — GitHub issue #30, modelcontextprotocol/ext-server-card

**Three callout cards:**

*Card 1 — Gateway operator (S-Reagan):*
> "A server should be able to say 'I have tools, they're dynamic, fetch them at runtime' as a distinct signal from having no tools."

*Card 2 — Internal gateway (christophercolumbusdog):*
> "Everyone builds their own catalog anyway — out of band, under whatever identity happened to be available."

*Card 3 — Arazzo spec (frankkilcommins):*
> "Declarative tool advertisement would enable Arazzo sourceDescriptions for MCP — pre-execution validation."

**Bottom bar:**
> github.com/modelcontextprotocol/ext-server-card/issues/30 · SEP-2127 submitted to MCP community

---

### Slide 16 — Takeaways
**Source:** NEW · Layout: Checklist cards (same style as ORD PDF slide 19)

**Title:**
> What to Take Away

**Five points:**
- MCP servers are discoverable today — Server Card + ORD, one URL, no session required
- Tool metadata in the card is optional but high-value — agents, registries, and gateways all benefit from it
- `tools/list` stays the runtime source of truth — the card is for discovery, not execution
- The pattern is proven: OpenAPI did this for REST. Server Card does it for MCP.
- If you build gateways or registries: your input on issue #30 shapes what the standard becomes

---

### Slide 17 — Try It · Contribute · Connect
**Source:** NEW · Layout: QR code cards (same style as ORD PDF slide 20)

**Title:**
> Try It · Contribute · Connect

**Card 1 — Demo repo:**
> github.com/open-resource-discovery/ord-mcp-server-card-demo
> `docker compose up` — spaceship demo running in 2 minutes

**Card 2 — GitHub Issue #30:**
> github.com/modelcontextprotocol/ext-server-card/issues/30
> Add your use case — especially if you run a gateway or registry

**Card 3 — SEP-2127:**
> MCP community proposal — link TBD
> The formal proposal for optional tool metadata in Server Card

**Card 4 — ORD Playground:**
> open-resource-discovery.github.io/mcp-server-card-ui/playground/
> Render any Server Card — paste a URL or JSON

---

## What to build first (Wednesday priority order)

These are the slides Sebastian needs to follow the arc. Build in this order:

1. **Slide 1** — title, 5 minutes
2. **Slide 4** — how discovery works today (two columns) — this is the thesis setup
3. **Slide 10** — Server Card JSON — this is the payoff
4. **Slide 13** — demo divider with table — orients the audience before the demo
5. **Slides 3, 9** — section dividers, text only
6. **Slides 5–8** — copy from ORD PDF (zero content work)
7. **Slides 2, 11, 14–17** — fill in after Wednesday

For Wednesday: slides 1, 3, 4, 5–8 (reuse), 9, 10, 13 as placeholders are enough for Sebastian to follow the full arc.
