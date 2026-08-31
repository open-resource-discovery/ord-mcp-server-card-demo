# Meeting: Sebastian Wennemers — MCPCon Talk Alignment

**Date**: 2026-08-12
**Purpose**: Align on demo approach and talk structure before building anything

---

## What We Have

| Asset | Owner | Status |
| --- | --- | --- |
| a2a-ord-demo (spaceship theme, ORD aggregator) | Sebastian | Built for KubeCon, open community repo |
| MCP Server Card schema + spec | Vyshnavi | v0.1.3, `mcp-protocol/spec/v1/` |
| SEP-2127 proposal | Both | Submitted to MCP community |
| Playground UI | Open community | Live at open-resource-discovery.github.io/mcp-server-card-ui/playground/ |

---

## Proposed Demo Concept

**Theme**: A spaceship system made of MCP servers — each component (thruster control, navigation, life support) is a separate MCP server. The audience sees the fragmentation problem and the ORD solution live.

**Flow**:

1. Multiple spaceship MCP servers running — each isolated, no shared discovery
2. Each server exposes `/.well-known/mcp-server-card.json` — static, no session needed
3. A pseudo ORD aggregator crawls those endpoints and builds a catalog
4. The playground renders one server's card live — audience sees what a Server Card looks like
5. The catalog shows all servers at once — without connecting to any of them

**Why this works for the talk**: The demo *is* the argument. Point-to-point chaos → static discovery → catalog. Audience walks away having *seen* the problem solved.

---

## Questions to Align On

### 1. Demo repo — new repo under `open-resource-discovery` org

- **Decision**: new repo, no fork — clone a2a-ord-demo, strip git history, push fresh
- **Why**: clean ownership, no fork badge, pure MCP + ORD story with no A2A mixed in
- **What to reuse from a2a-ord-demo**: spaceship theme, Docker Compose structure, ORD aggregator pattern
- **How**: `git clone` → `rm -rf .git` → `git init` → `gh repo create open-resource-discovery/<repo-name> --public --push --source=.`
- **Align with Sebastian**: confirm repo name and who has org rights to create it

### 2. Scope of the MCP servers

- Do the spaceship servers need to be real callable MCP servers (tools actually work), or just expose a Server Card endpoint?
- For the talk's purpose, the card + catalog is the point — real tools are nice but not required
- Real tools would make the playground demo richer (audience can see tools listed and call them)

### 3. Division of work

- Sebastian: spaceship theme, Docker Compose setup, ORD aggregator pattern
- Vyshnavi: MCP server implementation, Server Card endpoints, playground integration, talk narrative

### 4. No SAP-internal content

- Demo must be fully open community — no SAP internal repos, infra, or branding in the demo itself
- Playground's existing demo servers are at `mcp-sample-servers.cfapps.sap.hana.ondemand.com` — need to decide if we replace these with spaceship servers or keep them

### 5. Talk structure — who covers what?

- Proposed split: Vyshnavi owns problem framing + ORD primer + Server Card design; Sebastian covers demo walkthrough (or vice versa)
- Need to agree on a handoff point

---

## Proposed Talk Structure (25 min)

| Segment | Duration | Speaker |
| --- | --- | --- |
| Hook — "1000 MCP servers, how do you know what's there?" | 2 min | TBD |
| Problem — live introspection doesn't scale | 3 min | TBD |
| ORD's answer — APIs solved this already | 4 min | TBD |
| Server Card design — playground demo | 6 min | TBD |
| Spaceship demo — aggregator + catalog | 7 min | TBD |
| SEP-2127 status + call to action | 3 min | TBD |

---

## Next Steps After This Meeting

- [ ] Agree on repo name and org
- [ ] Agree on division of work
- [ ] Create new repo under `open-resource-discovery`
- [ ] Build spaceship MCP servers with Server Card endpoints
- [ ] Wire into playground as demo servers
- [ ] First full rehearsal before Sept 1
