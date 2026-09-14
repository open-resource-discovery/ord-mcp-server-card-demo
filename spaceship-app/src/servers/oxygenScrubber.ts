import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createSpaceshipServer, type ServerCardConfig } from "../shared/createServer.js";

const card: ServerCardConfig = {
  name: "spaceship.demo/oxygen-scrubber",
  title: "Backup Oxygen Scrubber",
  version: "1.0.0",
  description: "Secondary CO2 scrubbing system and emergency oxygen reserves — independent of primary life support",
  tools: [
    {
      name: "get_scrubber_status",
      title: "Get Scrubber Status",
      description: "Check backup CO2 scrubbing capacity, filter saturation, and reserve oxygen levels",
      annotations: { readOnlyHint: true },
      inputSchema: {},
      outputSchema: {
        type: "object",
        properties: {
          backup_scrubbers_active: { type: "boolean" },
          scrubber_units_available: { type: "number" },
          filter_saturation_percent: { type: "number" },
          co2_processing_capacity_ppm_per_min: { type: "number" },
          oxygen_reserve_liters: { type: "number" },
          reserve_status: { type: "string" },
          status: { type: "string" },
          message: { type: "string" },
        },
      },
    },
    {
      name: "activate_backup_scrubbers",
      title: "Activate Backup Scrubbers",
      description: "Bring secondary CO2 scrubbing units online to supplement or replace primary system",
      annotations: { idempotentHint: true },
      inputSchema: {},
      outputSchema: {
        type: "object",
        properties: {
          status: { type: "string" },
          units_online: { type: "number" },
          combined_capacity_ppm_per_min: { type: "number" },
          estimated_co2_normalisation_minutes: { type: "number" },
          command_acknowledged: { type: "boolean" },
          message: { type: "string" },
        },
      },
    },
    {
      name: "tap_oxygen_reserve",
      title: "Tap Oxygen Reserve",
      description: "Release oxygen from emergency reserve tanks into the cabin",
      inputSchema: {
        properties: {
          liters: {
            type: "number",
            description: "Volume of O2 to release in liters (max 500 per cycle)",
            minimum: 10,
            maximum: 500,
          },
        },
        required: ["liters"],
      },
      outputSchema: {
        type: "object",
        properties: {
          status: { type: "string" },
          liters_released: { type: "number" },
          reserve_remaining_liters: { type: "number" },
          cabin_o2_boost_percent: { type: "number" },
          command_acknowledged: { type: "boolean" },
          message: { type: "string" },
        },
      },
    },
  ],
};

function registerTools(server: McpServer) {
  server.tool(
    "get_scrubber_status",
    "Check backup CO2 scrubbing capacity, filter saturation, and reserve oxygen levels",
    {},
    async () => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          backup_scrubbers_active: false,
          scrubber_units_available: 3,
          filter_saturation_percent: 12,
          co2_processing_capacity_ppm_per_min: 800,
          oxygen_reserve_liters: 2200,
          reserve_status: "full",
          status: "standby",
          message: "Backup scrubbers on standby. Reserves full. Ready to activate on command.",
        }, null, 2),
      }],
    }),
  );

  server.tool(
    "activate_backup_scrubbers",
    "Bring secondary CO2 scrubbing units online to supplement or replace primary system",
    {},
    async () => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "active",
          units_online: 3,
          combined_capacity_ppm_per_min: 800,
          estimated_co2_normalisation_minutes: 14,
          command_acknowledged: true,
          message: "Command sent to backup scrubbing system. System response: All 3 units online. Combined with primary, CO2 should reach safe levels in ~14 minutes. Monitor readings to confirm.",
        }, null, 2),
      }],
    }),
  );

  server.tool(
    "tap_oxygen_reserve",
    "Release oxygen from emergency reserve tanks into the cabin",
    { liters: z.number().min(10).max(500) },
    async ({ liters }) => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "releasing",
          liters_released: liters,
          reserve_remaining_liters: 2200 - liters,
          cabin_o2_boost_percent: +(liters / 200).toFixed(2),
          command_acknowledged: true,
          message: `Command sent to oxygen reserve system. System response: ${liters}L O2 released into cabin. Reserve at ${2200 - liters}L remaining. Monitor cabin O2 levels to confirm.`,
        }, null, 2),
      }],
    }),
  );
}

export function createOxygenScrubberServer(serverUrl: string) {
  return createSpaceshipServer(serverUrl, card, registerTools);
}
