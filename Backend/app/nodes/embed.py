from __future__ import annotations
from app.graphs.state import GraphState
from app.services.embedding_service import embedding_service

async def run(state: GraphState) -> GraphState:
    chunks = state.get("chunks")
    if chunks:
        texts = [c["content"] for c in chunks]
        vectors = embedding_service.encode(texts)
        return {**state, "embeddings": vectors}

    query = state.get("rewritten_query") or state.get("question") or ""
    query_vec = embedding_service.encode(query)
    return {**state, "query_embedding": query_vec}
