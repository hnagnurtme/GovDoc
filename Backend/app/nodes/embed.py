from __future__ import annotations

import hashlib

import numpy as np

from app.graphs.state import GraphState
from app.utils.settings import get_settings

settings = get_settings()


def _text_to_embedding(text: str, dim: int) -> list[float]:
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    seed = int.from_bytes(digest[:8], byteorder="little", signed=False)
    rng = np.random.default_rng(seed)
    vector = rng.standard_normal(dim)
    norm = np.linalg.norm(vector)
    if norm == 0:
        return vector.tolist()
    return (vector / norm).tolist()


async def run(state: GraphState) -> GraphState:
    dim = settings.embed_dim

    if state.get("chunks"):
        vectors = [_text_to_embedding(c["content"], dim) for c in state["chunks"]]
        return {**state, "embeddings": vectors}

    query = state.get("rewritten_query") or state.get("question") or ""
    query_vec = _text_to_embedding(query, dim)
    return {**state, "query_embedding": query_vec}
