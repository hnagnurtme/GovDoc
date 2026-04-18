# GovDoc Backend (FastAPI + Qdrant)

This folder contains the backend RAG service for GovDoc Intellisense.

## Structure

```text
app/
  main.py
  graphs/
    state.py
    import_graph.py
    query_graph.py
  nodes/
    scan.py
    chunk.py
    embed.py
    store.py
    rewrite.py
    search.py
    rerank.py
    generate.py
  db/
    connection.py
  llm/
    router.py
    prompts.py
  utils/
    logger.py
    settings.py
    text_utils.py
    validators.py

tests/
feature_engineering/
```

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### GET `/api/v1/health`
Returns backend and Qdrant health status.

### GET `/api/v1/llm/credentials`
Checks OpenRouter/Groq credentials.

Query params:
- `provider=all|openrouter|groq`

### POST `/api/v1/query`
Runs legal query flow and returns answer + citations.

Request example:

```json
{
  "question": "What are employee unilateral termination rights?",
  "top_k": 5,
  "legal_domain": "lao_dong",
  "is_active_only": true
}
```

### POST `/api/v1/import`
Imports a document into the retrieval index.

Form fields:
- `file` (required)
- `doc_type` (optional, default `luat`)
- `legal_domain` (optional)

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key |
| `GROQ_API_KEY` | No | Groq fallback API key |
| `GROQ_MODEL` | No | Default: `llama-3.1-70b-versatile` |
| `OPENROUTER_MODEL` | No | Default: `x-ai/grok-3` |
| `QDRANT_URL` | Yes | Example: `http://127.0.0.1:6333` |
| `QDRANT_API_KEY` | No | Qdrant API key |
| `QDRANT_COLLECTION` | No | Default: `law_chunks` |
| `EMBED_MODEL` | No | Default: `BAAI/bge-m3` |
| `EMBED_DIM` | No | Default: `1024` |
| `LOG_LEVEL` | No | Default: `INFO` |

## Run Locally

```bash
# Start Qdrant first
cd ../Data
docker compose up -d

# Start backend
cd ../Backend
/Users/anhnon/my_virtualenvs/govdoc/bin/python -m uvicorn app.main:app --reload --port 8000
```

Swagger docs:
- `http://localhost:8000/docs`

## Run Tests

```bash
/Users/anhnon/my_virtualenvs/govdoc/bin/python -m pytest tests -v
```
