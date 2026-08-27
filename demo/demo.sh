#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="$(dirname "$0")/docker-compose.yml"

if [[ "${1:-}" == "down" ]]; then
  docker compose -f "$COMPOSE_FILE" down --remove-orphans
  echo "All services stopped."
  exit 0
fi

if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  echo "Error: ANTHROPIC_API_KEY is not set. Export it before running the demo."
  exit 1
fi

echo "Starting spaceship MCP servers..."
docker compose -f "$COMPOSE_FILE" up --build -d --remove-orphans

echo "Waiting for services to be healthy..."
for service in thruster navigation life-support comms catalog-agent; do
  printf "  %-20s" "$service"
  until docker compose -f "$COMPOSE_FILE" ps "$service" --format '{{.Status}}' | grep -q healthy; do
    sleep 1
    printf "."
  done
  echo " ready"
done

echo ""
echo "Verifying Server Cards..."
for port in 3001 3002 3003 3004; do
  name=$(curl -sf "http://localhost:${port}/.well-known/mcp-server-card.json" | node -e "let b='';process.stdin.on('data',d=>b+=d);process.stdin.on('end',()=>console.log(JSON.parse(b).title))")
  printf "  port %s  %s\n" "$port" "$name"
done

echo ""
echo "Verifying ORD catalog..."
count=$(curl -sf http://localhost:3005/ord/v1/documents/catalog | node -e "let b='';process.stdin.on('data',d=>b+=d);process.stdin.on('end',()=>console.log(JSON.parse(b).apiResources.length))")
echo "  Catalog Agent: ${count} MCP servers via ORD"

echo ""
echo "Demo ready!"
echo ""
echo "  Thruster Control   http://localhost:3001/.well-known/mcp-server-card.json"
echo "  Navigation         http://localhost:3002/.well-known/mcp-server-card.json"
echo "  Life Support       http://localhost:3003/.well-known/mcp-server-card.json"
echo "  Comms Relay        http://localhost:3004/.well-known/mcp-server-card.json"
echo ""
echo "  ORD Catalog (paste into playground):"
echo "  http://localhost:3005/.well-known/open-resource-discovery"
echo ""
echo "  Poor agent (before discovery):"
echo "  curl http://localhost:3005/api/chat -H 'Content-Type: application/json' \\"
echo "    -d '{\"message\": \"The thruster is overheating!\", \"withDiscovery\": false}'"
echo ""
echo "  Poor agent (after Server Card discovery):"
echo "  curl http://localhost:3005/api/chat -H 'Content-Type: application/json' \\"
echo "    -d '{\"message\": \"The thruster is overheating!\", \"withDiscovery\": true}'"
echo ""
echo "  Or open demo.http in VS Code (REST Client extension)"
