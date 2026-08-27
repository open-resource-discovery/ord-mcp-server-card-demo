export const config = {
  port: parseInt(process.env.PORT ?? "3000", 10),
  serverUrl: process.env.SERVER_URL ?? `http://localhost:${process.env.PORT ?? "3000"}`,
  serverType: process.env.SERVER_TYPE ?? "",
};
