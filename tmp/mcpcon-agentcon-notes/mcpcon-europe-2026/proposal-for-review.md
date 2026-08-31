---
title: AGNTCon + MCPCon Europe 2026 — Talk Proposal (for review)
date: 2026-06-05
event: AGNTCon + MCPCon Europe 2026, Amsterdam, 17–18 September
deadline: 2026-06-08, 23:59 CEST
status: Draft for review — please send corrections by Jun 7
---

# Talk Proposal — for review

Sharing this with reviewers before I submit to the CFP. Please flag anything that's wrong, weak, or worth sharpening. Deadline is **8 June**, so feedback by **7 June** would be ideal.

---

## CFP rules the proposal must satisfy (LF official)

These are the rules every reviewer should keep in mind when giving feedback:

1. **Code of Conduct** — all speakers must adhere; Inclusive Speaker Orientation course recommended.
2. **Panels** — any talk with more than two speakers needs all names in the initial submission. All-male panels are not accepted. (This is a 1–2 speaker session, so not in scope, but worth knowing.)
3. **One complimentary pass per submission**, regardless of how many speakers. Co-speaker travel needs separate funding.
4. **No sales or marketing pitches.** Talks that read as vendor promotion get rejected. The proposal must read as a technical contribution to the MCP community, not as an SAP showcase.
5. **No unlicensed or closed-source technologies.** Anything we reference must be open — SEP-2127 (Anthropic public spec), the open MCP repo, ORD (open spec), our Server Card playground/renderer (public). SAP-internal artefacts must not appear.
6. **Reviewers assess subject-matter expertise from the proposal itself.** Templated or AI-generated descriptions lacking specificity get filtered out. The description must reflect the speaker's own experience — concrete artefacts, named contested points, actual contributions.
7. **Slides must be submitted before the event** if accepted.

### Self-audit against rules

| Rule | Current draft | OK? |
|---|---|---|
| Sales/marketing avoided | Names SAP only as origin of a *donated* contribution to the open spec; positions the talk as feedback-seeking, not selling | ✅ |
| Open-source only | References: SEP-2127 (public), ORD (open), public playground/renderer, MCP open spec | ✅ |
| Subject-matter expertise visible | Names the contested point we shaped externally (tools-in-card), the architectural line (runtime vs catalog-time), the analogue (ORD provider–aggregator–consumer) | ✅ |
| Specificity vs templated | Cites SEP-2127 by name, references the well-known endpoint pattern, names co-aligned external contributors implicitly | ✅ |
| Speakers ≤ 2 | Vyshnavi + 1 co-speaker (TBC) | ✅ |
| Complimentary pass note | Captured in submission file — co-speaker travel cost needs decision | ✅ |

---

## Title

**From API Catalogs to Agent Catalogs: Solving MCP Server Discovery with Open Resource Discovery**

---

## Track

Interoperability/Protocols (MCP, A2A)

---

## Format

Session Presentation, 25 minutes

---

## Description

As MCP servers multiply, the ecosystem is hitting the fragmentation problem APIs hit a decade ago: every server is a point-to-point integration with no shared way to discover or describe it. Live introspection over a connected session does not scale to the catalogs, registries, and gateways that need to reason about thousands of servers without starting each one up.

Open Resource Discovery (ORD) solved this for APIs, events, and data products. Each resource publishes a static, machine-readable description at a well-known endpoint. Aggregators crawl those descriptions and build catalogs that registries and gateways can query without connecting to the resource. Recent ORD work applies the same shape to agents and the MCP servers they depend on, scoping the dependency to the tools and prompts an agent uses.

The same pattern fits MCP. The talk walks through a Server Card design that serves tools, prompts, and resources alongside metadata from a well-known endpoint, so registries and gateways can reason about a server before any agent connects. The design has been contributed into the open MCP community via SEP-2127, with a public renderer and playground demonstrating it end-to-end.

---

## Benefits to the Ecosystem

MCP server discovery is currently being worked on in parallel across the community, registries, gateways, and adjacent specifications. Without convergence, the ecosystem risks shipping incompatible discovery layers and fragmenting integrations the way pre-OpenAPI APIs once did.

If you are building an MCP gateway or registry, you take away a clear separation between catalog-time discovery and runtime introspection, with the architectural trade-offs made explicit so you do not have to rediscover them. If you are authoring an MCP server, you can plug it into the public renderer and playground and see what self-describing looks like in practice. If you are tracking adjacent specifications, you get a concrete analogue: ORD has already worked through the provider, aggregator, and consumer roles for self-describing resources, with patterns the MCP discovery story can adopt directly.

What the session hopes to get in return is feedback from the MCP implementer community on the design, so the next iteration of MCP server discovery converges around a shared model. The intended outcome is a more interoperable ecosystem where MCP servers are self-describing by default, and where catalogs, registries, and gateways can reason about them uniformly.

---

## Speaker

Vyshnavi Gadamsetti — Central Architect, Cross Product Architecture (CPA), SAP

Co-speaker: TBC

---

## Open questions for reviewers

1. Is the title sharp enough, or does it bury the MCP angle?
2. Does the description show enough technical depth (the CFP guide explicitly filters out AI-generated, generic submissions)?
3. Is the "tools in the card" line a strength (it's the contested point we shaped externally) or a risk (committee may not want a contested talk)?
4. Anything missing about SAP's contribution that should be in the abstract?
