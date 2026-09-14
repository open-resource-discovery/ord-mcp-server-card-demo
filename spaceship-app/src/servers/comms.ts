import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createSpaceshipServer, type ServerCardConfig } from "../shared/createServer.js";

const card: ServerCardConfig = {
  name: "spaceship.demo/comms-relay",
  title: "Comms Relay",
  version: "1.0.0",
  description: "Handles communication signal strength, frequency scanning, and distress signals",
  tools: [
    {
      name: "check_signal_strength",
      title: "Check Signal Strength",
      description: "Check current communication signal strength and active channels",
      annotations: { readOnlyHint: true },
      inputSchema: {},
      outputSchema: {
        type: "object",
        properties: {
          signal_strength_percent: { type: "number" },
          active_channels: { type: "array", items: { type: "string" } },
          latency_ms: { type: "number" },
          status: { type: "string" },
          note: { type: "string" },
        },
      },
    },
    {
      name: "scan_frequencies",
      title: "Scan Frequencies",
      description: "Scan a frequency range for active communication channels",
      inputSchema: {
        properties: {
          range: {
            type: "string",
            description: "Frequency range to scan (e.g. 'UHF', 'VHF', 'deep-space')",
          },
        },
        required: ["range"],
      },
      outputSchema: {
        type: "object",
        properties: {
          range_scanned: { type: "string" },
          active_frequencies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                freq_mhz: { type: "number" },
                label: { type: "string" },
                active: { type: "boolean" },
              },
            },
          },
          scan_complete: { type: "boolean" },
        },
      },
    },
    {
      name: "send_distress_signal",
      title: "Send Distress Signal",
      description: "Broadcast an emergency distress signal on all available frequencies",
      annotations: { destructiveHint: false },
      inputSchema: {},
      outputSchema: {
        type: "object",
        properties: {
          status: { type: "string" },
          frequencies_used: { type: "array", items: { type: "string" } },
          message: { type: "string" },
          estimated_response_time_hours: { type: "number" },
        },
      },
    },
  ],
};

function registerTools(server: McpServer) {
  server.tool(
    "check_signal_strength",
    "Check current communication signal strength and active channels",
    {},
    async () => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          signal_strength_percent: 34,
          active_channels: ["Earth-Relay-7", "Mars-Station-Alpha"],
          latency_ms: 284_000,
          status: "degraded",
          note: "Signal degraded due to solar interference. Earth relay barely in range.",
        }, null, 2),
      }],
    }),
  );

  server.tool(
    "scan_frequencies",
    "Scan a frequency range for active communication channels",
    { range: z.string() },
    async ({ range }) => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          range_scanned: range,
          active_frequencies: [
            { freq_mhz: 406.028, label: "International Distress", active: true },
            { freq_mhz: 243.0, label: "Military Distress", active: false },
            { freq_mhz: 121.5, label: "Civil Aviation Guard", active: false },
          ],
          scan_complete: true,
        }, null, 2),
      }],
    }),
  );

  server.tool(
    "send_distress_signal",
    "Broadcast an emergency distress signal on all available frequencies",
    {},
    async () => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "transmitted",
          frequencies_used: ["406.028 MHz", "243.0 MHz", "deep-space relay"],
          message: "MAYDAY transmitted. Signal includes position, crew count, and nature of emergency.",
          estimated_response_time_hours: 4.7,
        }, null, 2),
      }],
    }),
  );
}

export function createCommsServer(serverUrl: string) {
  return createSpaceshipServer(serverUrl, card, registerTools);
}
