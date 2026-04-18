# GovDoc Devops Setup

Folder nay chua bo setup container day du cho:

- Frontend (React + Vite build static qua Nginx)
- Backend (FastAPI)
- Vector DB (Qdrant)
- Nginx Gateway (reverse proxy FE + API)

## Cau truc

- `docker-compose.yml`: chay toan bo stack
- `Dockerfile.backend`: build image backend
- `Dockerfile.frontend`: build image frontend
- `nginx.frontend.conf`: cau hinh Nginx cho SPA
- `nginx.gateway.conf`: reverse proxy

## Yeu cau truoc khi chay

1. Da cai Docker + Docker Compose plugin.
2. Da tao file `Backend/.env` va dien API key.

Gia tri quan trong trong `Backend/.env`:

```env
OPENROUTER_API_KEY=...
GROQ_API_KEY=...
OPENROUTER_MODEL=x-ai/grok-3
GROQ_MODEL=llama-3.1-70b-versatile
QDRANT_COLLECTION=law_chunks
```

Luu y:

- Trong container, `QDRANT_URL` duoc compose override thanh `http://qdrant:6333`.
- Khong dat `QDRANT_URL=http://127.0.0.1:6333` khi backend chay trong container.

## Chay nhanh

```bash
cd Devops
docker compose up -d --build
```

## Luong request qua Nginx

- Truy cap app: `http://localhost:3000` -> Nginx Gateway -> Frontend
- Goi API: `http://localhost:3000/api/v1/...` -> Nginx Gateway -> Backend

Luu y quan trong:

- Backend da co prefix `/api/v1`.
- Nginx forward nguyen duong dan `/api/v1/...` vao backend, khong rewrite.

## Kiem tra trang thai

```bash
docker compose ps
docker compose logs -f nginx
docker compose logs -f backend
docker compose logs -f qdrant
```

## Endpoint sau khi chay

- Frontend (qua gateway): `http://localhost:3000`
- Backend health (qua gateway): `http://localhost:3000/api/v1/health`
- LLM credential check (qua gateway): `http://localhost:3000/api/v1/llm/credentials?provider=all`
- Backend direct (debug): `http://localhost:8000/api/v1/health`
- Qdrant: `http://localhost:6333`

## Dung va cleanup

Dung stack:

```bash
cd Devops
docker compose down
```

Dung va xoa ca volume Qdrant:

```bash
cd Devops
docker compose down -v
```

## Rebuild khi code thay doi

```bash
cd Devops
docker compose up -d --build
```
