FROM node:26.13.1-slim@sha256:e6bedef217677b276c591795e169840edd9096dbf13f29df8ef8d1856b8820bc AS builder
WORKDIR /app
COPY super-agent/package.json super-agent/package-lock.json super-agent/tsconfig.json .npmrc ./
RUN npm install --global --ignore-scripts npm@11.20.0 && npm ci --ignore-scripts
COPY super-agent/src/ src/
RUN rm -f src/*.test.ts && npm run build

FROM node:26.13.1-slim@sha256:e6bedef217677b276c591795e169840edd9096dbf13f29df8ef8d1856b8820bc

LABEL org.opencontainers.image.source=https://github.com/open-resource-discovery/ord-mcp-server-card-demo
LABEL org.opencontainers.image.description="MCP Server Card Demo - Catalog Agent"
LABEL org.opencontainers.image.licenses=Apache-2.0

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY super-agent/public/ ./public/
COPY super-agent/src/assets/ ./public/assets/

ENV NODE_ENV=production
EXPOSE 3000
USER node

HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=5 \
  CMD node -e "fetch('http://localhost:3000/health').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]
