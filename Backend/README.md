### GovDoc Intellisense Backend (FastAPI + Qdrant)

Backend RAG cho phap luat Viet Nam, su dung FastAPI, LangGraph va Qdrant cho vector search.

## Cau truc

```text
app/
├── main.py
├── graphs/
│   ├── state.py
│   ├── import_graph.py
│   └── query_graph.py
├── nodes/
│   ├── scan.py
│   ├── chunk.py
│   ├── embed.py
│   ├── store.py      # upsert points vao Qdrant
│   ├── rewrite.py
│   ├── search.py     # vector search tu Qdrant
│   ├── rerank.py
│   └── generate.py
├── db/
│   └── connection.py # Qdrant client + helpers
├── llm/
│   ├── router.py
│   └── prompts.py
└── utils/
    ├── logger.py
    ├── text_utils.py
    └── validators.py
```

## API

### POST /query

Request:

```json
{
  "question": "Nguoi lao dong co quyen don phuong cham dut hop dong trong truong hop nao?",
  "top_k": 5,
  "legal_domain": "lao_dong",
  "is_active_only": true
}
```

Response:

```json
{
  "answer": "...",
  "citations": [],
  "legal_domain": "lao_dong",
  "latency_ms": 120
}
```

### POST /import

`multipart/form-data`

- `file`: pdf file
- `doc_type`: `luat|nghi_dinh|thong_tu|quyet_dinh|nghi_quyet`
- `legal_domain`: optional

Response:

```json
{
  "doc_id": "filename",
  "chunks_created": 10,
  "status": "success"
}
```

### GET /health

Response:

```json
{
  "status": "ok",
  "qdrant": "connected",
  "llm_router": "openrouter",
  "chunks_indexed": 100
}
```

## Environment variables

| Bien | Bat buoc | Mo ta |
|---|---|---|
| `OPENROUTER_API_KEY` | Co | API key OpenRouter |
| `GROQ_API_KEY` | Khong | API key fallback |
| `GROQ_MODEL` | Khong | Mac dinh `llama-3.1-70b-versatile` |
| `OPENROUTER_MODEL` | Khong | Mac dinh `x-ai/grok-3` |
| `QDRANT_URL` | Co | Vi du `http://127.0.0.1:6333` |
| `QDRANT_API_KEY` | Khong | API key neu Qdrant secure |
| `QDRANT_COLLECTION` | Khong | Mac dinh `law_chunks` |
| `EMBED_MODEL` | Khong | Mac dinh `BAAI/bge-m3` |
| `EMBED_DIM` | Khong | Mac dinh `1024` |
| `LOG_LEVEL` | Khong | Mac dinh `INFO` |

## Chay local

```bash
# 1) Chay Qdrant
cd ../Data
docker compose up -d

# 2) Chay backend
cd ../Backend
/Users/anhnon/my_virtualenvs/govdoc/bin/python -m uvicorn app.main:app --reload --port 8000
```

Swagger: http://localhost:8000/docs

## Chay tests

```bash
/Users/anhnon/my_virtualenvs/govdoc/bin/python -m pytest tests -v
```
