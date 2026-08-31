# MCP Server Card Demo — Concept & Context

## MCPCon 2026 (Amsterdam, Sept 17–18)

**Speakers**: Vyshnavi Gadamsetti + Sebastian Wennemers
**Talk title**: MCP Guidelines at SAP: From Awareness to Action *(working title)*
**Talk duration**: ~25 min

---

## Demo Narrative

**The problem**: MCP servers exist but there's no standard way to discover them or know what they offer without connecting first — point-to-point chaos at scale.

**The solution**: Server Card at `/.well-known/mcp-server-card.json` — static discovery, read before you connect.

**Demo flow**:
1. Multiple spaceship MCP servers running — each isolated, no shared discovery
2. Each server exposes `/.well-known/mcp-server-card.json` — static, no session needed
3. A pseudo ORD aggregator crawls those endpoints and builds a catalog
4. The playground renders one server's card live — audience sees what a Server Card looks like
5. The catalog shows all servers at once — without connecting to any of them

**Why this works**: The demo *is* the argument. Audience walks away having seen the problem solved.

---

## Repo Structure (reworked from a2a-ord-demo)

| a2a-ord-demo | this repo |
|---|---|
| `spaceship-app` | MCP servers (spaceship components) exposing tools + Server Card at well-known endpoint |
| `super-agent` | Discovery client that reads Server Cards and builds a catalog |
| `demo/` | Scripts showing: 1) Server Card endpoint, 2) discovery, 3) tool invocation |

---

## Proposed Talk Structure (25 min)

| Segment | Duration |
|---|---|
| Hook — "1000 MCP servers, how do you know what's there?" | 2 min |
| Problem — live introspection doesn't scale | 3 min |
| ORD's answer — APIs solved this already | 4 min |
| Server Card design — playground demo | 6 min |
| Spaceship demo — aggregator + catalog | 7 min |
| SEP-2127 status + call to action | 3 min |

---

## Assets

| Asset | Owner | Status |
|---|---|---|
| a2a-ord-demo (spaceship theme, ORD aggregator) | Sebastian | Built for KubeCon, reused here |
| MCP Server Card schema + spec | Vyshnavi | v0.1.3, `mcp-protocol/spec/v1/` |
| SEP-2127 proposal | Both | Submitted to MCP community |
| Playground UI | Open community | Live at open-resource-discovery.github.io/mcp-server-card-ui/playground/ |

---

## Division of Work

- **Sebastian**: spaceship theme, Docker Compose setup, ORD aggregator pattern
- **Vyshnavi**: MCP server implementation, Server Card endpoints, playground integration, talk narrative

---

## Key Decisions

- New repo under `open-resource-discovery` org — no fork badge, clean ownership, pure MCP + ORD story
- Demo must be fully open community — no SAP internal repos, infra, or branding
- Spaceship servers should be real callable MCP servers (tools actually work) for a richer playground demo

---

## Open Questions

- [ ] Do the spaceship servers need real working tools or just Server Card endpoints?
- [ ] Replace playground's existing demo servers with spaceship servers, or keep them?
- [ ] Confirm who has org rights to create repo under `open-resource-discovery`

---

## Next Steps

- [ ] Build spaceship MCP servers with Server Card endpoints
- [ ] Wire into playground as demo servers
- [ ] First full rehearsal before Sept 1
