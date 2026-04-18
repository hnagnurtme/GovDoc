# Data Service: qdrant-ai-rag

Muc tieu cua folder nay la chay Qdrant phuc vu vector search cho GovDoc backend.

## Cau truc

- `docker-compose.yml`: service `qdrant-ai-rag`

## Chay nhanh

```bash
cd Data
docker compose up -d
```

Kiem tra service:

```bash
docker compose ps
docker compose logs -f qdrant-ai-rag
```

## Thong so mac dinh

- URL HTTP: `http://127.0.0.1:6333`
- URL gRPC: `127.0.0.1:6334`
- Collection (backend se tu tao): `law_chunks`

Kiem tra health Qdrant:

```bash
curl http://127.0.0.1:6333/healthz
```

## Ket noi voi Backend

Cap nhat `.env` trong Backend:

```env
QDRANT_URL=http://127.0.0.1:6333
QDRANT_API_KEY=
QDRANT_COLLECTION=law_chunks
```

Sau do chay backend:

```bash
cd ../Backend
/Users/anhnon/my_virtualenvs/govdoc/bin/python -m uvicorn app.main:app --reload --port 8000
```

## Reset du lieu Qdrant

Canh bao: lenh nay xoa toan bo data vector da index.

```bash
cd Data
docker compose down -v
docker compose up -d
```
