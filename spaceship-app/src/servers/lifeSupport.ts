import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createSpaceshipServer, type ServerCardConfig } from "../shared/createServer.js";

const card: ServerCardConfig = {
  name: "spaceship.demo/life-support",
  title: "Life Support",
  version: "1.0.0",
  description: "Monitors and controls oxygen, temperature, pressure, and CO2 scrubbing",
  tools: [
    {
      name: "get_life_support_status",
      title: "Get Life Support Status",
      description: "Get current oxygen, CO2, temperature, and pressure readings",
      annotations: { readOnlyHint: true },
      inputSchema: {},
      outputSchema: {
        type: "object",
        properties: {
          oxygen_percent: { type: "number" },
          co2_ppm: { type: "number" },
          cabin_temperature_celsius: { type: "number" },
          pressure_kpa: { type: "number" },
          status: { type: "string" },
          warning: { type: "string" },
        },
      },
    },
    {
      name: "adjust_oxygen_level",
      title: "Adjust Oxygen Level",
      description: "Adjust cabin oxygen concentration percentage",
      annotations: { idempotentHint: true },
      inputSchema: {
        properties: {
          percentage: {
            type: "number",
            description: "Target O2 concentration (18–25%)",
            minimum: 18,
            maximum: 25,
          },
        },
        required: ["percentage"],
      },
      outputSchema: {
        type: "object",
        properties: {
          status: { type: "string" },
          new_oxygen_percent: { type: "number" },
          command_acknowledged: { type: "boolean" },
          message: { type: "string" },
        },
      },
    },
    {
      name: "vent_co2",
      title: "Vent CO2",
      description: "Activate CO2 scrubbers and vent excess carbon dioxide",
      inputSchema: {},
      outputSchema: {
        type: "object",
        properties: {
          status: { type: "string" },
          co2_before_ppm: { type: "number" },
          co2_estimated_after_ppm: { type: "number" },
          duration_minutes: { type: "number" },
          command_acknowledged: { type: "boolean" },
          message: { type: "string" },
        },
      },
    },
  ],
};

function registerTools(server: McpServer) {
  server.tool(
    "get_life_support_status",
    "Get current oxygen, CO2, temperature, and pressure readings",
    {},
    async () => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          oxygen_percent: 19.2,
          co2_ppm: 4800,
          cabin_temperature_celsius: 21.5,
          pressure_kpa: 101.3,
          status: "warning",
          warning: "CO2 levels elevated (normal: <1500 ppm). CO2 scrubbers at 78% capacity.",
        }, null, 2),
      }],
    }),
  );

  server.tool(
    "adjust_oxygen_level",
    "Adjust cabin oxygen concentration percentage",
    { percentage: z.number().min(18).max(25) },
    async ({ percentage }) => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "adjusted",
          new_oxygen_percent: percentage,
          command_acknowledged: true,
          message: `Command sent to life support. System response: Oxygen output adjusted to ${percentage}%. Estimated cabin stabilisation: 12 minutes. Monitor readings to confirm.`,
        }, null, 2),
      }],
    }),
  );

  server.tool(
    "vent_co2",
    "Activate CO2 scrubbers and vent excess carbon dioxide",
    {},
    async () => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "venting",
          co2_before_ppm: 4800,
          co2_estimated_after_ppm: 1100,
          duration_minutes: 8,
          command_acknowledged: true,
          message: "Command sent to CO2 scrubbing system. System response: Scrubbers activated, venting in progress. Estimated time to safe levels: 8 minutes. Monitor CO2 readings to confirm.",
        }, null, 2),
      }],
    }),
  );
}

export function createLifeSupportServer(serverUrl: string) {
  return createSpaceshipServer(serverUrl, card, registerTools);
}
