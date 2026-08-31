import express from "express";
import { config } from "./config.js";
import { fetchAllServerCards } from "./catalog.js";
import { runAgent, type Stage } from "./agent.js";
import { createOrdRouter } from "./ordRouter.js";
import { UI_HTML } from "./ui.js";

const app = express();
app.use(express.json());

app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (_req.method === "OPTIONS") { res.sendStatus(200); return; }
  next();
});

// ORD endpoints — playground discovers all 4 spaceship servers from here
app.use(createOrdRouter(config.serverUrl, config.spaceshipUrls, config.publicSpaceshipUrls));

// Demo UI — served inline from compiled source
app.get("/", (_req, res) => res.setHeader("Content-Type", "text/html").send(UI_HTML));

// Catalog — returns all Server Cards
app.get("/api/catalog", async (_req, res) => {
  const cards = await fetchAllServerCards(config.spaceshipUrls);
  res.json({
    servers: cards.map(({ baseUrl, card }) => ({
      baseUrl,
      name: card.name,
      title: card.title,
      description: card.description,
      tools: (card.tools ?? []).map((t) => t.name),
      tags: card.tags ?? [],
    })),
    total: cards.length,
  });
});

app.post("/api/chat", async (req, res) => {
  const { message, stage = 3 } = req.body as { message: string; stage?: Stage };

  if (!message) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  try {
    const result = await runAgent(message, stage as Stage);
    res.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(config.port, () => {
  console.log(`\nCatalog Agent running on port ${config.port}`);
  console.log(`  ORD:     ${config.serverUrl}/.well-known/open-resource-discovery`);
  console.log(`  Catalog: ${config.serverUrl}/api/catalog`);
  console.log(`  Chat:    POST ${config.serverUrl}/api/chat`);
  console.log(`  Health:  ${config.serverUrl}/health`);
  console.log(`\nWatching spaceship servers:`);
  config.spaceshipUrls.forEach((url) => console.log(`  ${url}`));
});

export { app };
