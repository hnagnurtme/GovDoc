### GovDoc Intellisense Backend use FastAPI

# app/ — Backend RAG

Module backend chính của hệ thống, bao gồm FastAPI server, 2 subgraph LangGraph, các node xử lý, kết nối MariaDB và LLM router.

---

## Cấu trúc

```
app/
├── main.py                  # FastAPI entrypoint
│
├── graphs/
│   ├── state.py             # GraphState TypedDict dùng chung
│   ├── import_graph.py      # Subgraph 1: import tài liệu PDF
│   └── query_graph.py       # Subgraph 2: xử lý câu hỏi người dùng
│
├── nodes/
│   ├── scan.py              # OCR / extract text từ PDF
│   ├── chunk.py             # Tách văn bản theo cấu trúc pháp lý
│   ├── embed.py             # Vector hoá query / chunk
│   ├── store.py             # Ghi chunk mới vào MariaDB
│   ├── rewrite.py           # Mở rộng và chuẩn hoá query
│   ├── search.py            # Vector search + BM25 hybrid
│   ├── rerank.py            # Cross-encoder rerank, filter is_active
│   └── generate.py          # Gọi LLM, format response + trích dẫn
│
├── db/
│   ├── connection.py        # Connection pool MariaDB
│   └── schema.sql           # DDL: bảng law_chunks + HNSW index
│
├── llm/
│   ├── router.py            # OpenRouter primary → Grok fallback
│   └── prompts.py           # System prompt + few-shot pháp luật VN
│
└── utils/
    ├── logger.py            # Structlog JSON logger
    ├── text_utils.py        # Hàm text dùng chung (normalize, abbr)
    └── validators.py        # Validate chunk_id, doc_type enum
```

---

## API Endpoints

### `POST /query`

Nhận câu hỏi pháp luật, trả về câu trả lời và danh sách điều khoản trích dẫn.

**Request:**
```json
{
  "question": "Người lao động có quyền đơn phương chấm dứt hợp đồng trong trường hợp nào?",
  "top_k": 5,
  "legal_domain": "lao_dong"
}
```

**Response:**
```json
{
  "answer": "Theo Điều 35 Bộ luật Lao động 2019...",
  "citations": [
    {
      "article_ref": "Điều 35 BLLĐ 2019",
      "doc_title": "Bộ luật Lao động 2019",
      "content": "Người lao động có quyền đơn phương chấm dứt...",
      "score": 0.96
    }
  ],
  "legal_domain": "lao_dong",
  "latency_ms": 1240
}
```

**Query params tuỳ chọn:**

| Param | Mặc định | Mô tả |
|---|---|---|
| `top_k` | `5` | Số chunk trả về từ vector search |
| `legal_domain` | `null` | Lọc theo lĩnh vực pháp lý |
| `is_active_only` | `true` | Chỉ dùng văn bản còn hiệu lực |

---

### `POST /import`

Import tài liệu PDF mới vào hệ thống qua Subgraph 1.

**Request:** `multipart/form-data`

```bash
curl -X POST /import \
  -F "file=@nghi_dinh_12_2025.pdf" \
  -F "doc_type=nghi_dinh" \
  -F "legal_domain=lao_dong"
```

**Response:**
```json
{
  "doc_id": "ND_12_2025",
  "chunks_created": 87,
  "status": "success"
}
```

---

### `GET /health`

Kiểm tra trạng thái hệ thống.

```json
{
  "status": "ok",
  "mariadb": "connected",
  "llm_router": "openrouter",
  "chunks_indexed": 142830
}
```

---

## graphs/

### `state.py` — GraphState

```python
from typing import TypedDict, Optional

class GraphState(TypedDict):
    # Input
    question: Optional[str]
    file_path: Optional[str]

    # FE nodes (import graph)
    raw_text: Optional[str]
    chunks: Optional[list[dict]]
    embeddings: Optional[list[list[float]]]

    # Query nodes
    rewritten_query: Optional[str]
    query_embedding: Optional[list[float]]
    retrieved_chunks: Optional[list[dict]]
    reranked_chunks: Optional[list[dict]]

    # Output
    answer: Optional[str]
    citations: Optional[list[dict]]
    legal_domain: Optional[str]
    error: Optional[str]
```

---

### `import_graph.py` — Subgraph 1

Xử lý tài liệu PDF mới đưa vào hệ thống.

```
START → scan → chunk → embed → store → END
```

```python
from langgraph.graph import StateGraph
from app.graphs.state import GraphState
from app.nodes import scan, chunk, embed, store

def build_import_graph():
    g = StateGraph(GraphState)
    g.add_node("scan",  scan.run)
    g.add_node("chunk", chunk.run)
    g.add_node("embed", embed.run)
    g.add_node("store", store.run)

    g.set_entry_point("scan")
    g.add_edge("scan",  "chunk")
    g.add_edge("chunk", "embed")
    g.add_edge("embed", "store")
    g.set_finish_point("store")

    return g.compile()
```

---

### `query_graph.py` — Subgraph 2

Xử lý câu hỏi người dùng và sinh câu trả lời.

```
START → rewrite → search → rerank → generate → END
                    ↑
              (embed query)
```

```python
from langgraph.graph import StateGraph
from app.graphs.state import GraphState
from app.nodes import rewrite, embed, search, rerank, generate

def build_query_graph():
    g = StateGraph(GraphState)
    g.add_node("rewrite",  rewrite.run)
    g.add_node("embed",    embed.run)
    g.add_node("search",   search.run)
    g.add_node("rerank",   rerank.run)
    g.add_node("generate", generate.run)

    g.set_entry_point("rewrite")
    g.add_edge("rewrite",  "embed")
    g.add_edge("embed",    "search")
    g.add_edge("search",   "rerank")
    g.add_edge("rerank",   "generate")
    g.set_finish_point("generate")

    return g.compile()
```

---

## nodes/

### `rewrite.py`

Mở rộng query tiếng Việt pháp lý — viết tắt thành tên đầy đủ, thêm từ khoá ngữ nghĩa.

```python
async def run(state: GraphState) -> GraphState:
    q = state["question"]
    # "BLDS" → "Bộ luật Dân sự"
    # "hợp đồng lao động" → thêm "chấm dứt, đơn phương, thời hạn"
    rewritten = await llm_rewrite(q)
    return {**state, "rewritten_query": rewritten}
```

---

### `search.py`

Kết hợp vector search và BM25 (hybrid retrieval).

```python
async def run(state: GraphState) -> GraphState:
    vec_results = await mariadb_vector_search(
        embedding=state["query_embedding"],
        top_k=20,
        is_active_only=True,
        legal_domain=state.get("legal_domain")
    )
    bm25_results = await bm25_search(state["rewritten_query"], top_k=10)
    merged = reciprocal_rank_fusion(vec_results, bm25_results)
    return {**state, "retrieved_chunks": merged[:10]}
```

---

### `rerank.py`

Cross-encoder rerank để chọn context chất lượng cao nhất.

```python
async def run(state: GraphState) -> GraphState:
    pairs = [(state["rewritten_query"], c["content"])
             for c in state["retrieved_chunks"]]
    scores = cross_encoder.predict(pairs)
    ranked = sorted(zip(state["retrieved_chunks"], scores),
                    key=lambda x: x[1], reverse=True)
    return {**state, "reranked_chunks": [c for c, _ in ranked[:5]]}
```

---

### `generate.py`

Gọi LLM và format response kèm trích dẫn điều khoản.

```python
async def run(state: GraphState) -> GraphState:
    context = build_context(state["reranked_chunks"])
    prompt  = prompts.qa_prompt(state["question"], context)
    answer  = await llm_router.generate(prompt)
    citations = extract_citations(state["reranked_chunks"])
    return {**state, "answer": answer, "citations": citations}
```

---

## db/

### `schema.sql`

```sql
CREATE TABLE law_chunks (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    chunk_id     VARCHAR(200) UNIQUE NOT NULL,
    doc_id       VARCHAR(100) NOT NULL,
    doc_title    VARCHAR(500),
    doc_type     ENUM('luat','nghi_dinh','thong_tu','quyet_dinh','nghi_quyet'),
    legal_domain VARCHAR(100),
    article_ref  VARCHAR(200),
    parent_ctx   VARCHAR(500),
    content      TEXT NOT NULL,
    is_active    BOOLEAN DEFAULT TRUE,
    effective_dt DATE,
    embedding    VECTOR(1024) NOT NULL,

    INDEX idx_doc_id (doc_id),
    INDEX idx_domain (legal_domain),
    INDEX idx_active (is_active),
    VECTOR INDEX idx_vec (embedding) DISTANCE=cosine
);
```

---

### `connection.py`

```python
import mariadb
from contextlib import asynccontextmanager

pool = mariadb.ConnectionPool(
    host=settings.DB_HOST,
    port=settings.DB_PORT,
    user=settings.DB_USER,
    password=settings.DB_PASSWORD,
    database=settings.DB_NAME,
    pool_size=10,
    pool_name="rag_pool"
)

@asynccontextmanager
async def get_conn():
    conn = pool.get_connection()
    try:
        yield conn
    finally:
        conn.close()
```

---

## llm/

### `router.py` — OpenRouter → Grok fallback

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=8))
async def generate(prompt: str) -> str:
    try:
        return await _call_openrouter(prompt)
    except (RateLimitError, ServiceUnavailableError) as e:
        logger.warning("openrouter_failed", error=str(e), fallback="grok_direct")
        return await _call_grok_direct(prompt)

async def _call_openrouter(prompt: str) -> str:
    # primary: POST https://openrouter.ai/api/v1/chat/completions
    # model: x-ai/grok-3
    ...

async def _call_grok_direct(prompt: str) -> str:
    # fallback: POST https://api.x.ai/v1/chat/completions
    # dùng GROK_API_KEY
    ...
```

---

### `prompts.py`

```python
SYSTEM_PROMPT = """Bạn là chuyên gia tư vấn pháp luật Việt Nam.
Trả lời dựa trên các điều khoản được cung cấp.
Luôn trích dẫn số điều, khoản cụ thể.
Nếu thông tin không đủ, hãy nói rõ thay vì suy đoán."""

def qa_prompt(question: str, context: str) -> str:
    return f"""{SYSTEM_PROMPT}

Các điều khoản pháp luật liên quan:
{context}

Câu hỏi: {question}

Trả lời:"""
```

---

## Environment variables

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `OPENROUTER_API_KEY` | Có | API key OpenRouter |
| `GROK_API_KEY` | Có | API key Grok (fallback) |
| `OPENROUTER_MODEL` | Không | Mặc định: `x-ai/grok-3` |
| `DB_HOST` | Có | MariaDB host |
| `DB_PORT` | Không | Mặc định: `3306` |
| `DB_NAME` | Có | Tên database |
| `DB_USER` | Có | User MariaDB |
| `DB_PASSWORD` | Có | Password MariaDB |
| `EMBED_MODEL` | Không | Mặc định: `BAAI/bge-m3` |
| `EMBED_DIM` | Không | Mặc định: `1024` |
| `LOG_LEVEL` | Không | Mặc định: `INFO` |

---

## Chạy local

```bash
# Từ thư mục gốc dự án
uvicorn app.main:app --reload --port 8000

# Với log JSON
LOG_LEVEL=DEBUG uvicorn app.main:app --reload
```

Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Chạy tests

```bash
# Toàn bộ backend tests
pytest tests/ -v

# Test riêng từng phần
pytest tests/test_query_graph.py -v
pytest tests/test_llm_router.py -v -k "test_fallback"

# Với coverage
pytest tests/ --cov=app --cov-report=term-missing
```

---

## Lưu ý triển khai

**MariaDB Vector plugin** — phải bật trước khi tạo bảng:

```sql
INSTALL SONAME 'ha_vector';
```

**Model embedding phải nhất quán** — `EMBED_MODEL` lúc chạy FE và lúc chạy backend phải giống nhau. Nếu đổi model, cần chạy lại toàn bộ FE pipeline.

**Fallback LLM** — hệ thống tự động chuyển sang Grok API trực tiếp khi OpenRouter lỗi 429/503, không cần can thiệp thủ công.