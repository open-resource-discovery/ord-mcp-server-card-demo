# ORD Reference — MCPCon Talk Context

Source: https://github.com/open-resource-discovery/specification  
Spec: https://open-resource-discovery.org/introduction

---

## What ORD Is (and Is Not)

**ORD is a standardized self-description protocol** — not a dynamic or real-time discovery system.

- Applications and services **self-describe** their exposed resources at a well-known endpoint
- An **aggregator** crawls those endpoints and builds a consolidated catalog
- Consumers query the aggregator — not each provider directly

ORD is pull-based and crawl-based. Providers expose static (or tenant-specific runtime) documents. Aggregators fetch and consolidate them. There is no push, no event stream, no live introspection.

> "ORD standardizes how this information can be automatically discovered and aggregated."  
> — ORD Introduction

---

## The Three Roles

| Role | What they do | Example |
| --- | --- | --- |
| **Provider** | Self-describes via ORD at `/.well-known/open-resource-discovery` | MCP server exposing a Server Card |
| **Aggregator** | Crawls providers, consolidates metadata, exposes ORD Discovery API | SAP Business Accelerator Hub, UCL, our Super Agent (simplified) |
| **Consumer** | Reads from the aggregator's catalog | Agent, registry, developer portal |

In the demo the Super Agent plays both Aggregator and Consumer — it reads the ORD document directly from each provider. In production a real aggregator sits between providers and consumers.

---

## Discovery Flow (Provider Side)

```
GET /.well-known/open-resource-discovery
  → { documents: [{ url: "/ord/v1/documents/catalog", accessStrategies: [...] }] }

GET /ord/v1/documents/catalog
  → { apiResources: [{ resourceDefinitions: [{ type: "mcp-server-card", url: "..." }] }] }

GET /.well-known/mcp-server-card.json
  → { name, title, remotes[], tools[] }
```

---

## What This Means for the Talk

The correct framing is **standardized self-description**, not dynamic discovery.

| Wrong framing | Correct framing |
| --- | --- |
| "ORD adds dynamic discovery" | "ORD makes servers self-describing — no manual URL list needed" |
| "ORD discovers servers at runtime" | "ORD provides a crawlable catalog — aggregators read it, consumers query the aggregator" |
| "ORD is like DNS" | "ORD is like OpenAPI for the catalog layer — machine-readable, standard, self-owned by the provider" |

---

## The Stage Progression (Corrected)

| Stage | Server source | Tool source | What changes |
| --- | --- | --- | --- |
| 1 | — | No MCP | Plain LLM, no tools |
| 2 | Config / env var (manually maintained) | `tools/list` at runtime | Consumer owns the server list |
| 3 | ORD document (provider self-describes) | `tools/list` at runtime | **Provider** owns the server list — no manual config |
| 4 | ORD document | Server Card `tools[]` | Provider also owns the tool catalog — no live connections needed |

Stage 2 → 3: ownership of the server list moves from consumer config to provider self-description  
Stage 3 → 4: ownership of the tool catalog moves from runtime introspection to static card metadata

---

## ORD in the Demo — Accurate Description

- The 4 spaceship servers are **ORD Providers**: each exposes `/.well-known/open-resource-discovery` → `/ord/v1/documents/catalog` → links to `/.well-known/mcp-server-card.json`
- The Super Agent acts as a simplified **ORD Aggregator + Consumer**: it reads the ORD document at `http://localhost:3005/ord/v1/documents/catalog` (which the Super Agent itself publishes, pointing to all 4 spaceship cards)
- In production: a real aggregator (UCL, a registry) would crawl the providers and agents would query the aggregator's catalog API

**Important:** in the demo the ORD document is published by the Super Agent, not each spaceship server individually. The spaceship servers each expose their own Server Card. The Super Agent aggregates the four Server Card URLs into one ORD document at its own `/ord/v1/documents/catalog` endpoint.

---

## ORD Does Not Replace Detailed Standards

ORD describes the catalog layer — identity, taxonomy, resource type, where to find the definition.  
OpenAPI describes the API in detail. Server Card describes the MCP server in detail.  
ORD links to both. It does not replace either.

Analogous to our talk: ORD → Server Card is the same relationship as ORD → OpenAPI document.

---

## Key Quote for Slides

> "ORD standardizes how this information can be automatically discovered and aggregated. Please note that ORD is no replacement for detailed resource definition standards like OpenAPI. Instead, it describes a bigger context with shared, high-level information, taxonomy and relations between the described resources."  
> — ORD Introduction
