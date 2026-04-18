from __future__ import annotations

from typing import Optional, TypedDict


class GraphState(TypedDict, total=False):
    question: Optional[str]
    file_path: Optional[str]
    doc_type: Optional[str]
    legal_domain: Optional[str]
    top_k: Optional[int]
    is_active_only: Optional[bool]

    raw_text: Optional[str]
    chunks: Optional[list[dict]]
    embeddings: Optional[list[list[float]]]

    rewritten_query: Optional[str]
    query_embedding: Optional[list[float]]
    retrieved_chunks: Optional[list[dict]]
    reranked_chunks: Optional[list[dict]]

    answer: Optional[str]
    citations: Optional[list[dict]]
    doc_id: Optional[str]
    chunks_created: Optional[int]
    status: Optional[str]
    latency_ms: Optional[int]
    error: Optional[str]
