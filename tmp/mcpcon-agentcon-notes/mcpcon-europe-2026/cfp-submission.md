---
title: AGNTCon + MCPCon Europe 2026 — CFP Submission
date: 2026-06-05
deadline: 2026-06-08
event: AGNTCon + MCPCon Europe 2026, Amsterdam, 17–18 September
jira: OWS3-624
status: Draft for review
---

# CFP Submission Draft — Field by Field

## Session Title

> **From API Catalogs to Agent Catalogs: Solving MCP Server Discovery with Open Resource Discovery**

Alternatives if too long:
- *Discovering MCP Servers at Scale: Lessons from API Self-Description*
- *MCP Server Cards: Applying ORD to Agent Tool Discovery*

---

## Session Description (≤1200 characters)

The CFP guide explicitly warns that AI-generated, generic descriptions get filtered out. The version below is concrete, names artefacts, and shows technical depth.

> As MCP servers multiply, the ecosystem is hitting the fragmentation problem APIs hit a decade ago: every server is a point-to-point integration with no shared way to discover or describe it. Live introspection over a connected session does not scale to the catalogs, registries, and gateways that need to reason about thousands of servers without starting each one up.
>
> Open Resource Discovery (ORD) solved this for APIs, events, and data products. Each resource publishes a static, machine-readable description at a well-known endpoint. Aggregators crawl those descriptions and build catalogs that registries and gateways can query without connecting to the resource. Recent ORD work applies the same shape to agents and the MCP servers they depend on, scoping the dependency to the tools and prompts an agent uses.
>
> The same pattern fits MCP. The talk walks through a Server Card design that serves tools, prompts, and resources alongside metadata from a well-known endpoint, so registries and gateways can reason about a server before any agent connects. The design has been contributed into the open MCP community via SEP-2127, with a public renderer and playground demonstrating it end-to-end.

(1,199 chars including paragraph breaks — fits the 1,200 limit.)

---

## Topic

**Interoperability/Protocols (MCP, A2A)**

(matches the official CFP topic list and Yong's recommendation)

---

## Session Format

**Session Presentation (25 minutes)**

(per the CFP page — the only options are 25-min Session, 25-min Panel, or 60-min Workshop)

---

## Audience Level

**Intermediate** — assumes basic familiarity with MCP and the idea of agent tool catalogs; no prior ORD knowledge required.

---

## Benefits to the Ecosystem

The CFP guide asks three things: *what you hope to get*, *what the audience gains*, *how it betters the ecosystem*. Answering all three in one narrative:

> MCP server discovery is currently being worked on in parallel across the community, registries, gateways, and adjacent specifications. Without convergence, the ecosystem risks shipping incompatible discovery layers and fragmenting integrations the way pre-OpenAPI APIs once did.
>
> If you are building an MCP gateway or registry, you take away a clear separation between catalog-time discovery and runtime introspection, with the architectural trade-offs made explicit so you do not have to rediscover them. If you are authoring an MCP server, you can plug it into the public renderer and playground and see what self-describing looks like in practice. If you are tracking adjacent specifications, you get a concrete analogue: ORD has already worked through the provider, aggregator, and consumer roles for self-describing resources, with patterns the MCP discovery story can adopt directly.
>
> What the session hopes to get in return is feedback from the MCP implementer community on the design, so the next iteration of MCP server discovery converges around a shared model. The intended outcome is a more interoperable ecosystem where MCP servers are self-describing by default, and where catalogs, registries, and gateways can reason about them uniformly.

---

## Presented this talk before?

**No** — this is a new talk built on work that has been published and reviewed inside the MCP community via SEP-2127, but never presented externally.

---

## Speaker

**Speaker Name:** Vyshnavi Gadamsetti

**Speaker Tagline:**
> Central Architect at SAP — driving MCP Server Card and ORD-based discovery for AI agents

**Email:** v.gadamsetti@sap.com

### Speaker Biography (≤500 characters)

> Vyshnavi Gadamsetti is a software architect at SAP, where she has worked for 14 years across enterprise software. Earlier in her career she worked at PwC. Her current work spans MCP (Model Context Protocol), ORD (Open Resource Discovery), agent extensibility and governance, and the SAP API guidelines that product teams build to. She represents SAP in the open MCP community.

(~375 chars — fits the 500 limit. No em-dash. No overclaim on artefacts.)

**LinkedIn:** *(your LinkedIn URL)*

**Company Website:** https://www.sap.com

**Company:** SAP SE

**Speaker Title:** Development Architect, SAP

**Country of residence:** *(fill in)*

---

## Co-speakers

**Sebastian Wennemers** — sebastian.wennemers@sap.com
*(volunteered Jun 5; confirm before adding to invitation)*

---

## Checkboxes

- [ ] Code of Conduct reviewed
- [ ] Inclusive Speaker Orientation reviewed
- [ ] Content Quality Agreement understood
- [ ] Personal data sharing consent

---

## Notes for self before submitting

1. **Speaker Title** — your email signature says "Assoc. Development Architect, Metadata & Domain Alignment - CoE, P&E". External-facing title might land better as "Central Architect, Cross Product Architecture" — pick whichever your manager would expect to see on a public schedule.
2. **Photo** — needs a square-croppable headshot.
3. **Co-speaker** — confirm with Sebastian before adding his email; the invite goes to him automatically.
4. **Country** — fill before submit.
5. **Optional diversity questions** — your call; they're confidential.

---

## Source thread

- Email: "RE: CFP Open: Speak at AGNTCon + MCPCon Europe 2026"
- Original abstract drafted 2026-05-27
- Manager approval (Franziska): 2026-05-28
- Yong's support + track suggestion: 2026-05-28
- Sebastian volunteered as co-speaker: 2026-06-05
- CFP deadline: 2026-06-08, 23:59 CEST
- Jira: OWS3-624 (under OWS3-534 ApeiroRA Outreach)
