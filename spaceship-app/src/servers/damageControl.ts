import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createSpaceshipServer, type ServerCardConfig } from "../shared/createServer.js";

const card: ServerCardConfig = {
  name: "spaceship.demo/damage-control",
  title: "Damage Control",
  version: "1.0.0",
  description: "Hull integrity monitoring, breach sealing, and emergency damage containment",
  tools: [
    {
      name: "assess_hull_damage",
      title: "Assess Hull Damage",
      description: "Run full structural scan and return damage report after an impact",
      annotations: { readOnlyHint: true },
      inputSchema: {},
    },
    {
      name: "seal_hull_breach",
      title: "Seal Hull Breach",
      description: "Activate emergency hull breach sealing protocol for a given section",
      annotations: { destructiveHint: false, idempotentHint: true },
      inputSchema: {
        properties: {
          section: {
            type: "string",
            description: "Hull section identifier (e.g. 'A3', 'B1', 'cargo-bay')",
          },
        },
        required: ["section"],
      },
    },
    {
      name: "close_emergency_bulkhead",
      title: "Close Emergency Bulkhead",
      description: "Seal bulkhead to isolate a damaged section and prevent pressure loss spreading",
      annotations: { idempotentHint: true },
      inputSchema: {
        properties: {
          section: {
            type: "string",
            description: "Section to isolate (e.g. 'port-aft', 'engineering-bay')",
          },
        },
        required: ["section"],
      },
    },
  ],
};

function registerTools(server: McpServer) {
  server.tool(
    "assess_hull_damage",
    "Run full structural scan and return damage report after an impact",
    {},
    async () => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          scan_time_utc: new Date().toISOString(),
          overall_integrity_percent: 61,
          status: "critical",
          breaches: [
            { section: "B2", severity: "major", pressure_loss_kpa_per_min: 1.4 },
            { section: "port-aft", severity: "minor", pressure_loss_kpa_per_min: 0.2 },
          ],
          structural_warnings: ["B2 bulkhead stress above threshold", "Port thruster mount compromised"],
          recommendation: "Seal section B2 immediately. Close port-aft bulkhead. Avoid full-thrust burns.",
        }, null, 2),
      }],
    }),
  );

  server.tool(
    "seal_hull_breach",
    "Activate emergency hull breach sealing protocol for a given section",
    { section: z.string() },
    async ({ section }) => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "sealing",
          section,
          sealant_deployed: true,
          estimated_seal_time_seconds: 45,
          pressure_loss_stopped: section === "B2",
          command_acknowledged: true,
          message: `Command sent to hull repair system. System response: Emergency sealant deployed to section ${section}. Structural patch active in ~45s. Physical inspection of section ${section} required to confirm seal integrity.`,
        }, null, 2),
      }],
    }),
  );

  server.tool(
    "close_emergency_bulkhead",
    "Seal bulkhead to isolate a damaged section and prevent pressure loss spreading",
    { section: z.string() },
    async ({ section }) => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "sealed",
          section,
          bulkhead: "closed",
          cabin_pressure_stable: true,
          command_acknowledged: true,
          message: `Command sent to bulkhead control. System response: Bulkhead closed for section ${section}, cabin pressure isolated and stable. Physical confirmation of bulkhead seal recommended.`,
        }, null, 2),
      }],
    }),
  );
}

export function createDamageControlServer(serverUrl: string) {
  return createSpaceshipServer(serverUrl, card, registerTools);
}
