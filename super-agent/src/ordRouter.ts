import { Router } from "express";
import { fetchServerCard, type ServerCard } from "./catalog.js";

export function createOrdRouter(baseUrl: string, spaceshipUrls: string[], publicSpaceshipUrls: string[]): Router {
  const router = Router();

  // Last-known Server Card per server. Refreshed best-effort on each catalog
  // read; a server that goes offline keeps its cached card, so the ORD document
  // still describes it (and its tools) without a live connection.
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

      return {
        ordId: `spaceship.demo:apiResource:${serverSlug}:v1`,
        title: serverTitle,
        shortDescription: `MCP server for ${serverTitle}`,
        version: "1.0.0",
        visibility: "public",
        releaseStatus: "active",
        partOfPackage: "spaceship.demo:package:spaceship:v1",
        partOfConsumptionBundles: [{ ordId: "spaceship.demo:consumptionBundle:open:v1" }],
        apiProtocol: "mcp",
        direction: "inbound",
        extensible: { supported: "no" },
        entryPoints: [publicUrl],
        resourceDefinitions: [
          {
            type: "mcp-server-card",
            mediaType: "application/json",
            url: `${publicUrl}/.well-known/mcp/server-card`,
            accessStrategies: [{ type: "open" }],
            // Server Card embedded inline: consumers get the full card (identity,
            // remotes, tools) from this one document without fetching each server.
            ...(cachedCard ? { card: cachedCard } : {}),
          },
        ],
        lastUpdate: "2026-08-26T00:00:00Z",
      };
    });

    res.json({
      $schema: "https://open-resource-discovery.org/spec-v1/interfaces/Document.schema.json",
      openResourceDiscovery: "1.14",
      policyLevels: ["sap:core:v1"],
      describedSystemInstance: { baseUrl },
      packages: [
        {
          ordId: "spaceship.demo:package:spaceship:v1",
          title: "Spaceship MCP Servers",
          shortDescription: "MCP servers for spaceship systems",
          version: "1.0.0",
          vendor: "spaceship.demo:vendor:SpaceshipDemo:",
        },
      ],
      consumptionBundles: [
        {
          ordId: "spaceship.demo:consumptionBundle:open:v1",
          title: "Open Access",
          version: "1.0.0",
          lastUpdate: "2026-08-26T00:00:00Z",
        },
      ],
      vendors: [{ ordId: "spaceship.demo:vendor:SpaceshipDemo:", title: "Spaceship Demo" }],
      apiResources,
    });
  });

  return router;
}
