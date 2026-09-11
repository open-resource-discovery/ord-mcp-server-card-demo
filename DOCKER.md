# Docker Quick Reference

## Navigate to project

```powershell
cd C:\Users\I328164\Documents\GitHub\ord-mcp-server-card-demo\demo
```

> All docker compose commands must be run from the `demo` folder.

## First run / clean rebuild

```powershell
$env:ANTHROPIC_AUTH_TOKEN = "sk-ant-..."
docker compose build --no-cache
docker compose up
```

## Start (already built)

```powershell
docker compose up
```

## Stop

```powershell
docker compose down
```

## Rebuild everything after code changes

```powershell
docker compose down
docker compose build --no-cache
docker compose up
```

## Rebuild only the catalog agent (UI / agent logic changes)

```powershell
docker compose build --no-cache catalog-agent
docker compose up catalog-agent
```

## Useful URLs (while running)

| URL | What it is |
|---|---|
| http://localhost:3005 | Demo UI |
| http://localhost:3005/ord/v1/documents/catalog | ORD catalog document |
| http://localhost:3005/api/catalog | Server Card summary (JSON) |
