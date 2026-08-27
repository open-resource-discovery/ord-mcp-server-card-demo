const defaultSpaceshipUrls = "http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004";

export const config = {
  port: parseInt(process.env.PORT ?? "3005", 10),
  serverUrl: process.env.SERVER_URL ?? `http://localhost:${process.env.PORT ?? "3005"}`,
  spaceshipUrls: (process.env.SPACESHIP_URLS ?? defaultSpaceshipUrls).split(","),
  publicSpaceshipUrls: (process.env.PUBLIC_SPACESHIP_URLS ?? process.env.SPACESHIP_URLS ?? defaultSpaceshipUrls).split(","),
  anthropicAuthToken: process.env.ANTHROPIC_AUTH_TOKEN,
  anthropicBaseUrl: process.env.ANTHROPIC_BASE_URL,
  ordDocUrl: `http://localhost:${process.env.PORT ?? "3005"}/ord/v1/documents/catalog`,
};
