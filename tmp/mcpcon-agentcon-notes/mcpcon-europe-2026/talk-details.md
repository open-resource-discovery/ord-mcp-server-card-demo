# MCPCon Europe 2026 — Talk Details

## Title

**From API Catalogs To Agent Catalogs: Solving MCP Server Discovery With Open Resource Discovery**

## Speakers

- Vyshnavi Gadamsetti, SAP SE
- Sebastian Wennemers, SAP SE

## Schedule

- **Date:** Friday, September 18, 2026
- **Time:** 12:40 – 13:05 CEST (25 min)
- **Room:** Emerald Room (Level 1)

---

## Abstract

As MCP servers multiply, the ecosystem is hitting the fragmentation problem APIs hit a decade ago: every server is a point-to-point integration with no shared way to discover or describe it. Live introspection over a connected session does not scale to the catalogs, registries, and gateways that need to reason about thousands of servers without starting each one up.

Open Resource Discovery (ORD) solved this for APIs, events, and data products. Each resource publishes a static, machine-readable description at a well-known endpoint. Aggregators crawl those descriptions and build catalogs that registries and gateways can query without connecting to the resource.

Recent ORD work applies the same shape to agents and the MCP servers they depend on, scoping the dependency to the tools and prompts an agent uses. The same pattern fits MCP. The talk walks through a Server Card design that serves tools, prompts, and resources alongside metadata from a well-known endpoint, so registries and gateways can reason about a server before any agent connects. The design has been contributed into the open MCP community via SEP-2127, with a public renderer and playground demonstrating it end-to-end.

---

## Key messages from abstract (for slide alignment)

- **The fragmentation parallel:** MCP today = APIs a decade ago — point-to-point, no shared discovery
- **The scaling problem:** Live introspection (tools/list) does not scale to catalogs, registries, gateways
- **The ORD solution:** Static, machine-readable description at a well-known endpoint — aggregators crawl, no connection needed
- **The MCP extension:** Server Card serves tools, prompts, resources from /.well-known/mcp-server-card.json
- **Community proof:** SEP-2127 submitted, public playground and renderer live end-to-end

## Related files

- [slide-content.md](slide-content.md) — full slide breakdown with reuse/new mapping and content per slide
- [proposal-for-review.md](proposal-for-review.md) — CFP submission
- [talk-structure-detailed.md](../talk-structure-detailed.md) — detailed talk structure notes
