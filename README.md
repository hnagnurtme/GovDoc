# GovDoc Intellisense README

GovDoc Intellisense is a Retrieval-Augmented Generation (RAG) system for Vietnamese legal question answering, built with LangGraph, Qdrant, and OpenRouter/Groq.

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2+-purple.svg)](https://langchain-ai.github.io/langgraph)
[![Qdrant](https://img.shields.io/badge/Qdrant-1.17+-teal.svg)](https://qdrant.tech)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Overview

GovDoc Intellisense lets users ask Vietnamese legal questions and receive grounded answers with article-level citations.

```text
User question -> LangGraph query pipeline -> Qdrant vector retrieval
               -> Rerank context -> LLM generation -> Answer + citations
```

---

## Architecture

```text
+--------------------------------------------------------+
|                  LangGraph Orchestrator                |
|  +----------------------+   +------------------------+ |
|  | Subgraph 1: Import   |   | Subgraph 2: Query     | |
|  | PDF -> Scan -> Chunk |   | Query -> Rewrite      | |
|  | -> Embed -> Store    |   | -> Embed -> Search    | |
|  |                      |   | -> Rerank -> Generate | |
|  +----------+-----------+   +------------------------+ |
+-------------|------------------------------------------+
              v
        Qdrant Vector Store
              ^
   Feature Engineering Pipeline (offline)
```

---

## Repository Structure

```text
Backend/
  app/                  # FastAPI + LangGraph backend
  feature_engineering/  # Offline FE pipeline
  tests/                # Backend tests

Frontend/               # React + Vite UI
Data/                   # Qdrant compose setup
Devops/                 # Full stack docker setup
```

---

## System Requirements

| Component | Version |
|---|---|
| Python | 3.11+ |
| Qdrant | 1.17+ |
| Docker | 24+ (optional) |
| RAM | 8GB+ (16GB recommended for embedding) |

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/hnagnurtme/GovDoc.git
cd GovDoc
pip install -e "./Backend[dev]"
```

### 2. Configure environment

Create `Backend/.env`:

```env
OPENROUTER_API_KEY=sk-or-...
GROQ_API_KEY=gsk_...
OPENROUTER_MODEL=x-ai/grok-3
GROQ_MODEL=llama-3.1-70b-versatile

QDRANT_URL=http://127.0.0.1:6333
QDRANT_API_KEY=
QDRANT_COLLECTION=law_chunks

EMBED_MODEL=BAAI/bge-m3
EMBED_DIM=1024
LOG_LEVEL=INFO
```

### 3. Start Qdrant

```bash
docker compose -f Data/docker-compose.yml up -d
```

### 4. Run backend

```bash
cd Backend
/Users/anhnon/my_virtualenvs/govdoc/bin/python -m uvicorn app.main:app --reload --port 8000
```

### 5. Optional: run full stack with Docker

```bash
cd Devops
docker compose up -d --build
```

---

## API Usage

### Query

```bash
curl -X POST http://localhost:8000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What are employee unilateral termination rights?","top_k":5}'
```

### Import document

```bash
curl -X POST http://localhost:8000/api/v1/import \
  -F "file=@path/to/new_law.pdf" \
  -F "doc_type=luat"
```

### Health

```bash
curl http://localhost:8000/api/v1/health
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Orchestration | LangGraph |
| API | FastAPI |
| Vector DB | Qdrant |
| Embedding | BAAI/bge-m3 |
| LLM Primary | Groq via OpenRouter |
| LLM Fallback | Groq direct API |

---

## License

MIT. See [LICENSE](LICENSE).
