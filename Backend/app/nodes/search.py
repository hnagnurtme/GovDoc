from __future__ import annotations

from typing import Any

import numpy as np

from app.graphs.state import GraphState
from app.utils.settings import get_settings

settings = get_settings()

SEED_CORPUS = [
    {
        "article_ref": "Dieu 35 BLLD 2019",
        "doc_title": "Bo luat Lao dong 2019",
        "legal_domain": "lao_dong",
        "content": "Nguoi lao dong co quyen don phuong cham dut hop dong lao dong trong nhieu truong hop.",
        "is_active": True,
    },
    {
        "article_ref": "Dieu 158 BLDS 2015",
        "doc_title": "Bo luat Dan su 2015",
        "legal_domain": "dan_su",
        "content": "Quyen so huu bao gom quyen chiem huu, su dung va dinh doat tai san.",
        "is_active": True,
    },
    {
        "article_ref": "Dieu 20 BLHS 2015",
        "doc_title": "Bo luat Hinh su 2015",
        "legal_domain": "hinh_su",
        "content": "Dong pham la truong hop co hai nguoi tro len co y cung thuc hien toi pham.",
        "is_active": True,
    },
]


def _embed_like(text: str, dim: int) -> np.ndarray:
    from app.nodes.embed import _text_to_embedding

    return np.array(_text_to_embedding(text, dim))


def _cosine(a: np.ndarray, b: np.ndarray) -> float:
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


async def run(state: GraphState) -> GraphState:
    top_k = state.get("top_k", 5)
    is_active_only = state.get("is_active_only", True)
    legal_domain = state.get("legal_domain")
    query_vec = np.array(state.get("query_embedding") or [0.0] * settings.embed_dim)

    candidates: list[dict[str, Any]] = []
    for item in SEED_CORPUS:
        if is_active_only and not item.get("is_active", True):
            continue
        if legal_domain and item.get("legal_domain") != legal_domain:
            continue

        score = _cosine(query_vec, _embed_like(item["content"], settings.embed_dim))
        candidates.append({**item, "score": round(score, 4)})

    candidates.sort(key=lambda x: x["score"], reverse=True)
    return {**state, "retrieved_chunks": candidates[: max(top_k * 2, 5)]}
