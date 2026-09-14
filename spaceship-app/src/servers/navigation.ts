import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createSpaceshipServer, type ServerCardConfig } from "../shared/createServer.js";

const card: ServerCardConfig = {
  name: "spaceship.demo/navigation",
  title: "Navigation",
  version: "1.0.0",
  description: "Manages spaceship position, heading, course plotting, and ETA calculations",
  tools: [
    {
      name: "get_current_position",
      title: "Get Current Position",
      description: "Get current coordinates, heading, and speed of the spaceship",
      annotations: { readOnlyHint: true },
      inputSchema: {},
      outputSchema: {
        type: "object",
        properties: {
          coordinates: {
            type: "object",
            properties: {
              x: { type: "number" },
              y: { type: "number" },
              z: { type: "number" },
            },
          },
          units: { type: "string" },
          heading_degrees: { type: "number" },
          speed_km_s: { type: "number" },
          current_destination: { type: "string" },
        },
      },
    },
    {
      name: "plot_course",
      title: "Plot Course",
      description: "Plot a course to a destination and calculate the optimal route",
      inputSchema: {
        properties: {
          destination: {
            type: "string",
            description: "Destination name (e.g. 'Mars Station Alpha', 'Jupiter Orbit')",
          },
        },
        required: ["destination"],
      },
      outputSchema: {
        type: "object",
        properties: {
          destination: { type: "string" },
          distance_km: { type: "number" },
          optimal_heading_degrees: { type: "number" },
          estimated_travel_time_hours: { type: "number" },
          fuel_required_percent: { type: "number" },
          course_set: { type: "boolean" },
        },
      },
    },
    {
      name: "check_eta",
      title: "Check ETA",
      description: "Get estimated time of arrival at current destination",
      annotations: { readOnlyHint: true },
      inputSchema: {},
      outputSchema: {
        type: "object",
        properties: {
          destination: { type: "string" },
          distance_remaining_km: { type: "number" },
          current_speed_km_s: { type: "number" },
          eta_hours: { type: "number" },
          eta_human: { type: "string" },
        },
      },
    },
  ],
};

function registerTools(server: McpServer) {
  server.tool(
    "get_current_position",
    "Get current coordinates, heading, and speed of the spaceship",
    {},
    async () => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          coordinates: { x: 142_000_000, y: 38_500_000, z: -2_100_000 },
          units: "km from Sol",
          heading_degrees: 47.3,
          speed_km_s: 18.4,
          current_destination: "Mars Station Alpha",
        }, null, 2),
      }],
    }),
  );

  server.tool(
    "plot_course",
    "Plot a course to a destination and calculate the optimal route",
    { destination: z.string() },
    async ({ destination }) => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          destination,
          distance_km: 54_600_000,
          optimal_heading_degrees: 52.7,
          estimated_travel_time_hours: 824,
          fuel_required_percent: 34,
          course_set: true,
        }, null, 2),
      }],
    }),
  );

  server.tool(
    "check_eta",
    "Get estimated time of arrival at current destination",
    {},
    async () => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          destination: "Mars Station Alpha",
          distance_remaining_km: 48_200_000,
          current_speed_km_s: 18.4,
          eta_hours: 728,
          eta_human: "30 days, 8 hours",
        }, null, 2),
      }],
    }),
  );
}

export function createNavigationServer(serverUrl: string) {
  return createSpaceshipServer(serverUrl, card, registerTools);
}
