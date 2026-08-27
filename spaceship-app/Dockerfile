FROM node:22-slim AS builder
WORKDIR /app
COPY spaceship-app/package.json spaceship-app/package-lock.json spaceship-app/tsconfig.json ./
RUN npm ci
COPY spaceship-app/src/ src/
RUN rm -f src/*.test.ts && npm run build

FROM node:22-slim

LABEL org.opencontainers.image.source=https://github.com/open-resource-discovery/ord-mcp-server-card-demo
LABEL org.opencontainers.image.description="MCP Server Card Demo - Spaceship MCP Server"
LABEL org.opencontainers.image.licenses=Apache-2.0

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
EXPOSE 3000
USER node

HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=5 \
  CMD node -e "fetch('http://localhost:3000/health').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]
