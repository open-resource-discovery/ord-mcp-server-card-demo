import { Router } from "express";

export function createOrdRouter(baseUrl: string, spaceshipUrls: string[], publicSpaceshipUrls: string[]): Router {
  const router = Router();

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

  router.get("/ord/v1/documents/catalog", (_req, res) => {
    const serverNames = ["thruster-control", "navigation", "life-support", "comms-relay"];
    const serverTitles = ["Thruster Control", "Navigation", "Life Support", "Comms Relay"];

    const apiResources = spaceshipUrls.map((internalUrl, i) => {
      const publicUrl = publicSpaceshipUrls[i] ?? internalUrl;
      return {
        ordId: `spaceship.demo:apiResource:${serverNames[i]}:v1`,
        title: serverTitles[i],
        shortDescription: `MCP server for ${serverTitles[i]}`,
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
            url: `${publicUrl}/.well-known/mcp-server-card.json`,
            accessStrategies: [{ type: "open" }],
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
