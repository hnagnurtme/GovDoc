# GovDoc Devops Setup

This folder contains a complete Docker setup for running GovDoc with:

- Frontend container
- Backend container
- Qdrant container
- Nginx gateway container

## Files

- `docker-compose.yml`: full stack orchestration
- `Dockerfile.backend`: backend image build
- `Dockerfile.frontend`: frontend image build
- `nginx.frontend.conf`: static frontend nginx config
- `nginx.gateway.conf`: gateway reverse proxy config

## Prerequisites

1. Docker and Docker Compose installed.
2. A configured `Backend/.env` file with valid API keys.

## Ensure .env Files

Run the bootstrap script before starting the stack:

```bash
./Devops/scripts/ensure-env.sh
```

What it does:

- Creates `Backend/.env` from `Backend/.env.example` if missing.
- Creates `Frontend/.env` from `Frontend/.env.example` if missing.
- Does not overwrite existing `.env` files.

Minimum `Backend/.env` values:

```env
OPENROUTER_API_KEY=...
GROQ_API_KEY=...
OPENROUTER_MODEL=x-ai/grok-3
GROQ_MODEL=llama-3.1-70b-versatile
QDRANT_COLLECTION=law_chunks
```

Note:
- In containers, backend uses `QDRANT_URL=http://qdrant:6333` from compose override.

## Start the Stack

```bash
cd Devops
docker compose up -d --build
```

## Traffic Flow

- App UI: `http://localhost:3000` -> Nginx gateway -> Frontend
- API: `http://localhost:3000/api/v1/...` -> Nginx gateway -> Backend

Backend natively exposes `/api/v1` routes.

## Useful Commands

```bash
cd Devops
docker compose ps
docker compose logs -f nginx
docker compose logs -f backend
docker compose logs -f qdrant
```

## Endpoints

- Frontend: `http://localhost:3000`
- API health through gateway: `http://localhost:3000/api/v1/health`
- LLM credential check through gateway: `http://localhost:3000/api/v1/llm/credentials?provider=all`
- Backend direct health: `http://localhost:8000/api/v1/health`
- Qdrant: `http://localhost:6333`

## Stop and Cleanup

```bash
cd Devops
docker compose down
```

Remove containers + volumes:

```bash
cd Devops
docker compose down -v
```

## Rebuild After Changes

```bash
cd Devops
docker compose up -d --build
```
