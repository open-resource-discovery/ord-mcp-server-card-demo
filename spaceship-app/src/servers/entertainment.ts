import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createSpaceshipServer, type ServerCardConfig } from "../shared/createServer.js";

const card: ServerCardConfig = {
  name: "spaceship.demo/entertainment",
  title: "Entertainment System",
  version: "1.0.0",
  description: "Cabin entertainment system — music, movies, and ambient lighting for crew recreation during transit",
  tools: [
    {
      name: "play_music",
      title: "Play Music",
      description: "Play background music in the cabin",
      annotations: { readOnlyHint: false, idempotentHint: true },
      inputSchema: {
        properties: {
          genre: {
            type: "string",
            description: "Music genre (e.g. 'ambient', 'classical', 'jazz')",
          },
        },
        required: ["genre"],
      },
    },
    {
      name: "stream_movie",
      title: "Stream Movie",
      description: "Stream a movie to the main cabin display",
      annotations: { idempotentHint: true },
      inputSchema: {
        properties: {
          title: {
            type: "string",
            description: "Movie title to stream",
          },
        },
        required: ["title"],
      },
    },
    {
      name: "set_cabin_lighting",
      title: "Set Cabin Lighting",
      description: "Adjust cabin ambient lighting colour and brightness for mood or relaxation",
      annotations: { idempotentHint: true },
      inputSchema: {
        properties: {
          mode: {
            type: "string",
            description: "Lighting mode: 'bright', 'dim', 'relax', 'sleep', 'party'",
          },
        },
        required: ["mode"],
      },
    },
  ],
};

function registerTools(server: McpServer) {
  server.tool(
    "play_music",
    "Play background music in the cabin",
    { genre: z.string() },
    async ({ genre }) => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "playing",
          genre,
          track: `${genre.charAt(0).toUpperCase() + genre.slice(1)} Playlist — Vol. 3`,
          message: `Now playing ${genre} music in the cabin. Enjoy the journey.`,
        }, null, 2),
      }],
    }),
  );

  server.tool(
    "stream_movie",
    "Stream a movie to the main cabin display",
    { title: z.string() },
    async ({ title }) => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "streaming",
          title,
          resolution: "4K",
          message: `Streaming "${title}" on the cabin display. Runtime: 2h 14m.`,
        }, null, 2),
      }],
    }),
  );

  server.tool(
    "set_cabin_lighting",
    "Adjust cabin ambient lighting colour and brightness",
    { mode: z.string() },
    async ({ mode }) => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "applied",
          mode,
          brightness_percent: mode === "sleep" ? 5 : mode === "dim" ? 30 : mode === "relax" ? 50 : 100,
          message: `Cabin lighting set to "${mode}" mode.`,
        }, null, 2),
      }],
    }),
  );
}

export function createEntertainmentServer(serverUrl: string) {
  return createSpaceshipServer(serverUrl, card, registerTools);
}
