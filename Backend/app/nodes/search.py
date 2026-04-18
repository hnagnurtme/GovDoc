from __future__ import annotations

from app.db.connection import search_chunks
from app.graphs.state import GraphState


async def run(state: GraphState) -> GraphState:
    query_embedding = state.get("query_embedding")
    if not query_embedding:
        return {**state, "retrieved_chunks": []}

    top_k = state.get("top_k", 5)
    legal_domain = state.get("legal_domain")
    is_active_only = state.get("is_active_only", True)

    try:
        retrieved = search_chunks(
            query_embedding=query_embedding,
            top_k=top_k,
            legal_domain=legal_domain,
            is_active_only=is_active_only,
        )
    except Exception:
        retrieved = []

    return {**state, "retrieved_chunks": retrieved}
