from __future__ import annotations

import tempfile
import time
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app.db.connection import check_connection
from app.graphs.import_graph import build_import_graph
from app.graphs.query_graph import build_query_graph
from app.llm import router
from app.utils.logger import get_logger
from app.utils.validators import validate_doc_type

logger = get_logger(__name__)
app = FastAPI(title="GovDoc Intellisense Backend", version="0.1.0")
API_PREFIX = "/api/v1"

import_graph = build_import_graph()
query_graph = build_query_graph()


class QueryRequest(BaseModel):
    question: str = Field(min_length=3)
    top_k: int = Field(default=5, ge=1, le=20)
    legal_domain: str | None = None
    is_active_only: bool = True


class Citation(BaseModel):
    article_ref: str | None = None
    doc_title: str | None = None
    content: str | None = None
    score: float = 0.0


class QueryResponse(BaseModel):
    answer: str
    citations: list[Citation]
    legal_domain: str | None = None
    latency_ms: int


class ImportResponse(BaseModel):
    doc_id: str
    chunks_created: int
    status: str


class CredentialCheckResult(BaseModel):
    provider: str
    ok: bool
    status_code: int
    detail: str


class CredentialCheckResponse(BaseModel):
    openrouter: CredentialCheckResult | None = None
    groq: CredentialCheckResult | None = None


@app.get(f"{API_PREFIX}/health")
async def health() -> dict:
    qdrant_status, chunks_indexed, db_error = check_connection()
    payload = {
        "status": "ok" if qdrant_status == "connected" else "degraded",
        "qdrant": qdrant_status,
        "llm_router": "openrouter",
        "chunks_indexed": chunks_indexed,
    }
    if db_error:
        payload["db_error"] = db_error
    return payload


@app.get(f"{API_PREFIX}/llm/credentials", response_model=CredentialCheckResponse)
async def llm_credentials(provider: str = "all") -> CredentialCheckResponse:
    provider = provider.lower().strip()
    if provider not in {"all", "openrouter", "groq"}:
        raise HTTPException(status_code=400, detail="provider must be one of: all, openrouter, groq")

    openrouter_result = None
    groq_result = None
    if provider in {"all", "openrouter"}:
        openrouter_result = CredentialCheckResult(**(await router.check_openrouter_credential()))
    if provider in {"all", "groq"}:
        groq_result = CredentialCheckResult(**(await router.check_groq_credential()))

    return CredentialCheckResponse(openrouter=openrouter_result, groq=groq_result)


@app.post(f"{API_PREFIX}/query", response_model=QueryResponse)
async def query(payload: QueryRequest) -> QueryResponse:
    t0 = time.perf_counter()
    result = await query_graph.ainvoke(
        {
            "question": payload.question,
            "top_k": payload.top_k,
            "legal_domain": payload.legal_domain,
            "is_active_only": payload.is_active_only,
        }
    )

    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])

    latency_ms = int((time.perf_counter() - t0) * 1000)
    return QueryResponse(
        answer=result.get("answer", ""),
        citations=[Citation(**c) for c in result.get("citations", [])],
        legal_domain=payload.legal_domain,
        latency_ms=latency_ms,
    )


@app.post(f"{API_PREFIX}/import", response_model=ImportResponse)
async def import_document(
    file: UploadFile = File(...),
    doc_type: str = Form("luat"),
    legal_domain: str | None = Form(default=None),
) -> ImportResponse:
    if not validate_doc_type(doc_type):
        raise HTTPException(status_code=400, detail="Invalid doc_type")

    suffix = Path(file.filename or "document.pdf").suffix or ".pdf"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        result = await import_graph.ainvoke(
            {
                "file_path": tmp_path,
                "doc_type": doc_type,
                "legal_domain": legal_domain,
            }
        )
    finally:
        Path(tmp_path).unlink(missing_ok=True)

    if result.get("error"):
        logger.warning("import_store_warning", warning=result["error"])

    logger.info("import_completed", doc_id=result.get("doc_id"), chunks=result.get("chunks_created"))
    return ImportResponse(
        doc_id=result.get("doc_id", "unknown"),
        chunks_created=int(result.get("chunks_created", 0)),
        status=result.get("status", "success"),
    )
