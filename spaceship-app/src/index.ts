import { config } from "./config.js";
import { createThrusterServer } from "./servers/thruster.js";
import { createNavigationServer } from "./servers/navigation.js";
import { createLifeSupportServer } from "./servers/lifeSupport.js";
import { createCommsServer } from "./servers/comms.js";

const serverFactories: Record<string, (url: string) => ReturnType<typeof createThrusterServer>> = {
  thruster: createThrusterServer,
  navigation: createNavigationServer,
  "life-support": createLifeSupportServer,
  comms: createCommsServer,
};

const factory = serverFactories[config.serverType];
if (!factory) {
  console.error(`Unknown SERVER_TYPE: "${config.serverType}". Must be one of: ${Object.keys(serverFactories).join(", ")}`);
  process.exit(1);
}

const app = factory(config.serverUrl);

app.listen(config.port, () => {
  console.log(`\n${config.serverType} server running on port ${config.port}`);
  console.log(`  Server Card: ${config.serverUrl}/.well-known/mcp-server-card.json`);
  console.log(`  MCP:         ${config.serverUrl}/mcp`);
  console.log(`  Health:      ${config.serverUrl}/health`);
});
