# GitHub Issue #30 — Add optional tool metadata to Server Card for offline discovery

**Repo:** https://github.com/modelcontextprotocol/ext-server-card  
**URL:** https://github.com/modelcontextprotocol/ext-server-card/issues/30  
**State:** Open  
**Author:** vyshnavigadamsetti (Vyshnavi Gadamsetti)  
**Labels:** enhancement, v2  
**Comments:** 4  
**Date opened:** June 17, 2026  

---

## Issue Body

One thing we keep running into with the current spec direction: without tool definitions in the card, the card doesn't really tell you what a server does.

The spec defers primitives because servers are dynamic, but there's a whole class of consumers that will never connect to a live MCP server like registries, developer portals, agent orchestrators planning tool routing. For them the card ends up like an API catalog that lists URLs but no operations.

The OpenAPI parallel feels apt here: static documentation of what a server supports, used for discovery not execution. That model works well in practice and I think the same approach can work for MCP tools.

The fix seems straightforward: add optional tools, resources, and prompts arrays using the existing MCP types. Dynamic servers just don't set them. Clients still use tools/list at runtime as the source of truth. The static list is for discovery, not execution.

We built an open-source [renderer](https://open-resource-discovery.github.io/mcp-server-card-ui/playground/) that already visualizes static tool definitions from card JSON and it works really well in practice. Happy to demo if helpful.

Related: [SEP-2127 comment](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127#issuecomment-4214712821)

---

## Comments

### Comment 1 — S-Reagan

Really like this direction, and the OpenAPI-for-discovery framing makes sense to me. The optional + opt-out + "tools/list stays the source of truth" model is exactly right, so no concerns there.

The one thing I'd add comes from the gateway/aggregator side, because "dynamic servers just don't set them" isn't quite cost-free for us. We run a gateway in front of ~1,100 servers where the tool list is per-caller: it shifts with the user's RBAC scope, per-integration credential state, usage-based discovery, and tool-scanning, so we genuinely can't publish an honest static list. That part's fine. But if static servers populate rich tool arrays and dynamic ones just leave the field empty, then in the exact consumers this is for (registries, portals, orchestrators) the dynamic servers render as empty or featureless next to the static ones. "Absent" is ambiguous too: a consumer can't tell "no tools" from "didn't bother" from "dynamic."

So my one real ask is to make `dynamic` a first-class value for these fields, not just "set it or don't." Let a server positively say "I have tools, they're dynamic, fetch them at runtime" as a distinct signal from an empty list and from a static list. Then a registry or orchestrator has something accurate to show and route on, and dynamic servers aren't quietly penalized for being honest. I think this came up as a sticking point on the original SEP, so not a new idea, just a vote for it.

One related thing worth keeping in mind: for a gateway especially, a static tool list at a `.well-known` endpoint is also a public recon surface, and tool descriptions are exactly the prompt-injection/poisoning vector. So even if the field existed we wouldn't populate it, which is another reason the `dynamic` marker matters: it lets us signal capability without publishing the actual surface.

Happy to be a dynamic/gateway test case if it helps figure out what these servers should expose instead. My guess is capability booleans, maybe counts or categories, and a pointer to live listing, rather than full tool defs. Either way, glad to weigh in early.

---

### Comment 2 — vyshnavigadamsetti

@pavelkornev @maiargu

---

### Comment 3 — christophercolumbusdog

Strong +1, and some operator evidence for the consumer class this issue describes.

I run an internal MCP gateway and a server directory at my company, fronting a few dozen OAuth-protected servers. The directory's job is to answer "what does this server offer?" for engineers deciding what to integrate, and for security reviews that build per-tool allowlists. There's currently no spec-compliant way to answer that question. `tools/list` sits behind the same authorization as tool calls, so in practice we pick between bad options. Have a human authenticate so the gateway can harvest the catalog with their token, then cache it; the cache goes stale, and there's no unauthenticated way to refresh or even validate it. Use a service identity, which may see a different catalog than a real user. Or have every server team duplicate their tool definitions out of band, which drifts from the runtime truth.

[SEP-2127](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127)'s "Why exclude primitives?" section gives the standing objection, that primitives vary by user and session so runtime `tools/list` is the only reliable truth. From the operator's seat that argument cuts the other way. Because there is no advertised catalog, everyone builds one anyway, out of band, harvested under whatever identity happened to be available. That catalog is *more* wrong than a publisher-authored one would ever be, and nothing in the protocol can tell you it's wrong. An advertised catalog is the OpenAPI model, the stable surface a publisher chooses to document, with no promise that every caller can invoke every entry. `tools/list` stays the per-principal runtime truth, unchanged. The draft spec already anticipates shared intermediaries caching catalogs ([SEP-2549](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2549) gives `tools/list` results `ttlMs` and `cacheScope: "public"`); this proposal just takes the borrowed identity out of the loop.

The proposal should also state explicitly that the tool metadata must be retrievable without user authentication, wherever it ends up living, since that's the entire value for this consumer class. [Spec issue #540](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/540) raised the same pre-auth gap for resources back in May 2025 and it's still open.

A few mechanics that would make this dependable for gateways and registries:

- a content hash or version per tool entry, so a consumer can detect drift against what `tools/list` later returns
- `requiredScopes` per tool, which also serves the scope-visibility asks in [SEP-1881](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1881) and [org discussion #698](https://github.com/orgs/modelcontextprotocol/discussions/698)
- per-tool opt-out (a visibility flag), so publishers can keep genuinely sensitive tools out of the advertised set; servers whose tools are fully tenant-defined simply publish nothing

On the security objection that usually comes up here: keeping schemas from unauthenticated callers can limit information leakage, and the opt-out covers that. It shouldn't be mistaken for access control. If knowing that a tool named `delete_database` exists materially weakens a deployment, the deployment's authorization is the problem, and the cost of the secrecy is paid by every registry, gateway, and security-review workflow in the ecosystem.

SEP-2127 invites "a follow-on SEP" to work out "variant enumeration and clear consumer contracts" before primitive advertisement is added. Happy to help draft that if there's appetite from the WG.

---

### Comment 4 — frankkilcommins

Also a +1 here from an [Arazzo Specification](https://spec.openapis.org/arazzo/v1.1.0.html) perspective. We had hoped that declarative tool advertisement would have made it into the Server Card extension definition. This would have enabled use to leverage these cards as part of our `sourceDescriptions` and then enable authoring workflows which leverage MCP tools, and in a manner where we could validate the correctness of the workflow document pre-execution.

This approach would follow along for how we support referencing OpenAPI, AsyncAPI, and also proposed [SOAP enhancements](https://github.com/OAI/Arazzo-Specification/pull/533) (leveraging WSDLs) for our v1.2 RC.

Happy to contribute to making this a reality (at least one that can be opted in to).

Generally adding new tools requires deployments, and thus variant forms of Server Cards can be regenerated to appropriately ensure what's declared is valid for the intended audience.

The folks at Cisco DevNet are working on a similar type of spec for describing MCP servers: https://mcpdesc.org/docs/specification/ which we're considering but would naturally would prefer to adopt a formal/official mcp specification (or extension) approach.

---

## Key Themes

1. **Core proposal**: Add optional `tools`, `resources`, `prompts` arrays to Server Card using existing MCP types. Dynamic servers omit them; `tools/list` remains runtime source of truth.

2. **`dynamic` marker request (S-Reagan)**: "absent" is ambiguous — consumers can't tell "no tools" from "didn't bother" from "dynamic." First-class `dynamic` value needed so dynamic servers aren't penalized.

3. **Gateway/auth gap (christophercolumbusdog)**: `tools/list` requires auth, so registries currently harvest catalogs with borrowed identities that drift and can't be validated. Static advertised catalog fixes this; must be retrievable without auth.

4. **Additional mechanics requested**: content hash per tool for drift detection, `requiredScopes` per tool, per-tool opt-out visibility flag.

5. **Arazzo integration (frankkilcommins)**: Wants to use Server Cards as `sourceDescriptions` in Arazzo workflow documents for pre-execution validation of MCP tool use. References mcpdesc.org as a competing effort.

6. **Related SEPs/issues**: SEP-2127, SEP-2549, SEP-1881, org discussion #698, spec issue #540.
