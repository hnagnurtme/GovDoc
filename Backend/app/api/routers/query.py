import time

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.query_service import run_query

router = APIRouter(tags=["query"])


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


@router.post("/query", response_model=QueryResponse)
async def query(payload: QueryRequest) -> QueryResponse:
    t0 = time.perf_counter()
    result = await run_query(
        question=payload.question,
        top_k=payload.top_k,
        legal_domain=payload.legal_domain,
        is_active_only=payload.is_active_only,
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
