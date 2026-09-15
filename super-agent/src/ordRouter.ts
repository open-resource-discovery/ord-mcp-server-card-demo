import { Router } from "express";
import { fetchServerCard, type ServerCard } from "./catalog.js";

export function createOrdRouter(baseUrl: string, spaceshipUrls: string[], publicSpaceshipUrls: string[]): Router {
  const router = Router();

  // Cache of last-known Server Cards per server, refreshed best-effort on each
  // catalog read. Used only for title/description in the ORD document itself.
  const cardCache = new Map<string, ServerCard>();

  function slugFromUrl(url: string): string {
    try { return new URL(url).hostname.replace(".local", ""); } catch { return url; }
  }

  router.get("/.well-known/open-resource-discovery", (_req, res) => {
    res.json({
      $schema: "https://open-resource-discovery.org/spec-v1/interfaces/Configuration.schema.json",
      openResourceDiscoveryV1: {
        documents: [
          {
            url: "/ord/v1/documents/catalog",
            accessStrategies: [{ type: "open" }],
          },
        ],
      },
    });
  });

  router.get("/ord/v1/documents/catalog", async (_req, res) => {
    // Best-effort crawl: update the cache for any server currently reachable.
    // Offline servers are skipped and keep whatever card was last cached.
    await Promise.all(
      spaceshipUrls.map(async (internalUrl) => {
        const card = await fetchServerCard(internalUrl);
        if (card) cardCache.set(internalUrl, card);
      }),
    );

    const apiResources = spaceshipUrls.map((internalUrl, i) => {
      const publicUrl = publicSpaceshipUrls[i] ?? internalUrl;
      const cachedCard = cardCache.get(internalUrl);

      const serverSlug = cachedCard?.name?.includes("/")
        ? cachedCard.name.split("/").pop()!
        : slugFromUrl(internalUrl);
      const serverTitle = cachedCard?.title ?? serverSlug;
      const serverDescription = cachedCard?.description ?? `MCP server for ${serverTitle}`;
      const serverDescriptionLong = `Accessible via the MCP streamable HTTP transport. Tool names, descriptions, and input schemas are published statically in the MCP Server Card at /.well-known/mcp/server-card and embedded in the ORD catalog document.`;

      return {
        ordId: `spaceship:apiResource:${serverSlug}:v1`,
        title: serverTitle,
        shortDescription: serverDescription,
        description: serverDescriptionLong,
        version: "1.0.0",
        visibility: "public",
        releaseStatus: "active",
        partOfPackage: "spaceship:package:spaceship:v1",
        partOfConsumptionBundles: [{ ordId: "spaceship:consumptionBundle:open:v1" }],
        apiProtocol: "mcp",
        direction: "inbound",
        extensible: { supported: "no" },
        entryPoints: [`${publicUrl}/mcp`],
        resourceDefinitions: [
          {
            type: "sap:mcp-server-card:v0",
            mediaType: "application/json",
            url: `${publicUrl}/.well-known/mcp/server-card`,
            accessStrategies: [{ type: "open" }],
          },
        ],
        lastUpdate: "2026-08-26T00:00:00Z",
      };
    });

    res.json({
      $schema: "https://open-resource-discovery.org/spec-v1/interfaces/Document.schema.json",
      openResourceDiscovery: "1.14",
      describedSystemInstance: { baseUrl },
      packages: [
        {
          ordId: "spaceship:package:spaceship:v1",
          title: "Spaceship MCP Servers",
          shortDescription: "MCP servers for all spacecraft systems in the demo",
          description: "A collection of MCP servers representing spacecraft subsystems used in the ORD and MCP Server Card discovery demo. Each server exposes tools for a specific system — thrusters, navigation, life support, communications, damage control, oxygen scrubbing, and entertainment.",
          version: "1.0.0",
          vendor: "customer:vendor:Customer:",
        },
      ],
      consumptionBundles: [
        {
          ordId: "spaceship:consumptionBundle:open:v1",
          title: "Open Access",
          shortDescription: "Openly accessible spacecraft MCP servers — no authentication required",
          version: "1.0.0",
          lastUpdate: "2026-08-26T00:00:00Z",
        },
      ],
      vendors: [{ ordId: "customer:vendor:Customer:", title: "Spaceship Demo" }],
      apiResources,
    });
  });

  return router;
}
