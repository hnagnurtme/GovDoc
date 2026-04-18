# GovDoc Intellisense

Hệ thống Retrieval-Augmented Generation (RAG) cho pháp luật Việt Nam, xây dựng trên LangGraph, Qdrant Vector Store và OpenRouter/Groq API.

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2+-purple.svg)](https://langchain-ai.github.io/langgraph)
[![Qdrant](https://img.shields.io/badge/Qdrant-1.13+-teal.svg)](https://qdrant.tech)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Tổng quan

`GovDoc Intellisense` cho phép người dùng đặt câu hỏi về pháp luật Việt Nam và nhận câu trả lời có trích dẫn điều khoản cụ thể. Hệ thống sử dụng dataset [`kiil-lab/vietnamese-law-corpus`](https://huggingface.co/datasets/kiil-lab/vietnamese-law-corpus) làm nguồn tri thức chính.

```
Người dùng hỏi → LangGraph query pipeline → Vector search Qdrant
               → Rerank context → LLM (Groq qua OpenRouter) → Trả lời + trích dẫn luật
```

---

## Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────┐
│                    LangGraph Orchestrator                │
│  ┌─────────────────────┐   ┌─────────────────────────┐  │
│  │  Subgraph 1: Import │   │  Subgraph 2: Query      │  │
│  │  PDF → Scan → Chunk │   │  Query → Rewrite        │  │
│  │  → Embed → Store    │   │  → Search → Rerank      │  │
│  └──────────┬──────────┘   │  → Generate             │  │
│             │              └──────────────────────────┘  │
└─────────────┼───────────────────────────────────────────┘
              ▼
    Qdrant Vector Store
     (HNSW index, cosine similarity)
              ▲
     Feature Engineering Pipeline
     (offline, chạy một lần)
```

---

## Cấu trúc thư mục

```
Backend/
├── .env                        # API keys, DB credentials
├── pyproject.toml
├── docker-compose.yml
├── Makefile
│
├── data/
│   ├── raw/                    # Parquet dump từ HuggingFace
│   ├── processed/              # Chunks sau FE (chunks.parquet)
│   └── cache/                  # Embedding cache (.npy)
│
├── feature_engineering/        # Pipeline xử lý dataset (offline)
│   ├── pipeline.py             # Entrypoint toàn bộ FE
│   ├── load_dataset.py         # Load từ HuggingFace
│   ├── cleaner.py              # Làm sạch text tiếng Việt
│   ├── splitter.py             # Tách theo Điều/Khoản/Điểm
│   ├── enricher.py             # Thêm metadata pháp lý
│   ├── embedder.py             # Vector hoá chunks
│   └── ingest.py               # Nạp vào Qdrant
│
├── app/                        # Backend chính (FastAPI + LangGraph)
│   ├── main.py
│   ├── graphs/                 # 2 subgraph LangGraph
│   ├── nodes/                  # Các node xử lý
│   ├── db/                     # Kết nối Qdrant
│   ├── llm/                    # Router OpenRouter/Groq
│   └── utils/
│
└── tests/
```


---

## Yêu cầu hệ thống

| Thành phần | Phiên bản |
|---|---|
| Python | 3.11+ |
| Qdrant | 1.13+ |
| Docker | 24+ (tuỳ chọn) |
| RAM | 8GB+ (16GB khuyến nghị khi embed) |

---

## Cài đặt nhanh

### 1. Clone và cài dependencies

```bash
git clone https://github.com/hnagnurtme/GovDoc.git
cd GovDoc

pip install -e ".[dev]"
```

### 2. Cấu hình môi trường

```bash
cp .env.example .env
```

Chỉnh sửa `.env`:

```env
# LLM
OPENROUTER_API_KEY=sk-or-...
GROQ_API_KEY=gsk_...
OPENROUTER_MODEL=x-ai/grok-3

# Vector DB
QDRANT_URL=http://127.0.0.1:6333
QDRANT_API_KEY=
QDRANT_COLLECTION=law_chunks

# HuggingFace
HF_TOKEN=hf_...

# Embedding
EMBED_MODEL=BAAI/bge-m3
EMBED_BATCH_SIZE=64
EMBED_DIM=1024
```

### 3. Khởi động Qdrant

```bash
docker compose -f Data/docker-compose.yml up -d
```

### 4. Chạy Feature Engineering pipeline

```bash
# Toàn bộ pipeline (lần đầu, ~30-60 phút tuỳ dataset)
make fe

# Hoặc chạy từng bước
python feature_engineering/pipeline.py --step load
python feature_engineering/pipeline.py --step clean
python feature_engineering/pipeline.py --step split
python feature_engineering/pipeline.py --step enrich
python feature_engineering/pipeline.py --step embed
python feature_engineering/pipeline.py --step ingest
```

### 5. Chạy backend

```bash
make serve
# hoặc
uvicorn app.main:app --reload --port 8000
```

---

## Sử dụng

### Query qua API

```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Quyền sở hữu tài sản được quy định như thế nào trong Bộ luật Dân sự?"}'
```

Kết quả:

```json
{
  "answer": "Theo Điều 158 Bộ luật Dân sự 2015, quyền sở hữu bao gồm quyền chiếm hữu, quyền sử dụng và quyền định đoạt tài sản của chủ sở hữu...",
  "citations": [
    {
      "article_ref": "Điều 158 BLDS 2015",
      "content": "Quyền sở hữu bao gồm quyền chiếm hữu...",
      "doc_title": "Bộ luật Dân sự 2015",
      "score": 0.94
    }
  ],
  "legal_domain": "dan_su"
}
```

### Import tài liệu mới

```bash
curl -X POST http://localhost:8000/import \
  -F "file=@path/to/new_law.pdf"
```

---

## Makefile commands

```bash
make fe          # Chạy toàn bộ feature engineering pipeline
make serve       # Khởi động FastAPI server
make test        # Chạy toàn bộ test suite
make lint        # Ruff + mypy
make clean       # Xoá cache và processed data
```

---

## Dataset

**Nguồn:** [`kiil-lab/vietnamese-law-corpus`](https://huggingface.co/datasets/kiil-lab/vietnamese-law-corpus)

Sau Feature Engineering, mỗi chunk lưu trong Qdrant có payload:

| Field | Mô tả |
|---|---|
| `chunk_id` | ID duy nhất: `{doc_id}_{D15}_{K1}` |
| `article_ref` | Trích dẫn đầy đủ: `"Điều 15 BLDS 2015"` |
| `doc_type` | `luat / nghi_dinh / thong_tu / quyet_dinh` |
| `legal_domain` | `dan_su / hinh_su / lao_dong / hanh_chinh / ...` |
| `parent_ctx` | Tên Chương/Mục chứa điều đó |
| `is_active` | Văn bản còn hiệu lực hay không |
| `effective_dt` | Ngày có hiệu lực |
| `embedding` | `VECTOR(1024)` — bge-m3 |

---

## Stack công nghệ

| Lớp | Công nghệ |
|---|---|
| Orchestration | LangGraph 0.2+ |
| API | FastAPI |
| Vector DB | Qdrant |
| Embedding | `BAAI/bge-m3` (multilingual) |
| LLM primary | Groq qua OpenRouter |
| LLM fallback | Groq API trực tiếp |
| Dataset | HuggingFace `datasets` |
| Text processing | `underthesea`, `regex`, `unicodedata` |

---

## Đóng góp

1. Fork repo
2. Tạo branch: `git checkout -b feat/ten-tinh-nang`
3. Commit: `git commit -m "feat: mô tả ngắn"`
4. Push và mở Pull Request

---

## License

MIT © 2025 — xem [LICENSE](LICENSE)