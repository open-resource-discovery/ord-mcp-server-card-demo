# MCPCon + AgentCon Talk Notes

**Title**: From API Catalogs To Agent Catalogs: Solving MCP Server Discovery With Open Resource Discovery  
**Speakers**: Vyshnavi Gadamsetti + Sebastian Wennemers, SAP SE  
**Event**: MCPCon + AgentCon 2026  
**Date**: Friday, September 18, 2026 — 12:40–13:05 CEST (25 min)  
**Venue**: Emerald Room (Level 1), Amsterdam

## Topic Summary

As MCP servers multiply, the ecosystem faces the same fragmentation problem APIs hit a decade ago — no shared way to discover or describe servers without connecting to each one.

ORD solved this for APIs, events, and data products via static, machine-readable descriptions at well-known endpoints. This talk applies the same pattern to MCP: a Server Card that serves tools, prompts, and resources alongside metadata, so registries and gateways can reason about a server before any agent connects.

The design has been contributed to the open MCP community via SEP-2127, with a public renderer and playground demonstrating it end-to-end.

## Folder Structure

```text
mcpcon-agentcon-notes/
├── README.md                  # This file — overview and index
├── outline.md                 # Talk structure and narrative arc
├── script.md                  # Speaker notes / script
├── demo-notes.md              # Demo walkthrough and setup
└── assets/                    # Slides, diagrams, screenshots
```

## Key References

- SEP-2127: MCP Server Card proposal (upstream MCP community)
- MCP Issue #1649
- Schema: `mcp-protocol/spec/v1/mcp-server-card.schema.yaml`
- ORD resource type: `sap:mcp-server-card:v0`
