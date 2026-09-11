import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createSpaceshipServer, type ServerCardConfig } from "../shared/createServer.js";

const card: ServerCardConfig = {
  name: "spaceship.demo/thruster-control",
  title: "Thruster Control",
  version: "1.0.0",
  description: "Controls the spaceship main propulsion and thruster systems",
  tools: [
    {
      name: "check_thruster_status",
      title: "Check Thruster Status",
      description: "Check current thruster temperature, power level, and efficiency",
      annotations: { readOnlyHint: true },
      inputSchema: {},
    },
    {
      name: "adjust_thrust_level",
      title: "Adjust Thrust Level",
      description: "Adjust thruster power level from 0 to 100 percent",
      annotations: { idempotentHint: true },
      inputSchema: {
        properties: {
          power_level: {
            type: "number",
            description: "Target power level (0–100)",
            minimum: 0,
            maximum: 100,
          },
        },
        required: ["power_level"],
      },
    },
    {
      name: "emergency_shutdown",
      title: "Emergency Shutdown",
      description: "Emergency shutdown of all thruster systems",
      annotations: { destructiveHint: true },
      inputSchema: {},
    },
  ],
};

function registerTools(server: McpServer) {
  server.tool(
    "check_thruster_status",
    "Check current thruster temperature, power level, and efficiency",
    {},
    async () => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "critical",
          temperature_celsius: 847,
          power_level_percent: 94,
          efficiency_percent: 61,
          warning: "CRITICAL: Temperature exceeding safe limit of 800°C. Immediate action required.",
        }, null, 2),
      }],
    }),
  );

  server.tool(
    "adjust_thrust_level",
    "Adjust thruster power level from 0 to 100 percent",
    { power_level: z.number().min(0).max(100) },
    async ({ power_level }) => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "adjusted",
          new_power_level_percent: power_level,
          estimated_temperature_celsius: Math.round(200 + power_level * 6.5),
          command_acknowledged: true,
          message: `Command sent to propulsion control. System response: Thrust level set to ${power_level}%. Temperature normalising — estimated ${Math.round(200 + power_level * 6.5)}°C. Physical confirmation of engine state recommended.`,
        }, null, 2),
      }],
    }),
  );

  server.tool(
    "emergency_shutdown",
    "Emergency shutdown of all thruster systems",
    {},
    async () => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "shutdown",
          power_level_percent: 0,
          temperature_celsius: 200,
          command_acknowledged: true,
          message: "Command sent to thruster systems. System response: All thruster systems offline. Power at 0%, temperature dropping to 200°C. Physical engine inspection recommended before restart.",
        }, null, 2),
      }],
    }),
  );
}

export function createThrusterServer(serverUrl: string) {
  return createSpaceshipServer(serverUrl, card, registerTools);
}
