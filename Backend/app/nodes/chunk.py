from __future__ import annotations

import re
from typing import Iterable

from app.graphs.state import GraphState
from app.utils.text_utils import normalize_text


def _iter_sections(text: str) -> Iterable[str]:
    parts = re.split(r"(?=Dieu\s+\d+|Điều\s+\d+)", text)
    for part in parts:
        cleaned = normalize_text(part)
        if cleaned:
            yield cleaned


async def run(state: GraphState) -> GraphState:
    raw_text = state.get("raw_text") or ""
    doc_id = (state.get("file_path") or "unknown").split("/")[-1].split(".")[0]

    chunks: list[dict] = []
    for idx, section in enumerate(_iter_sections(raw_text), start=1):
        chunks.append(
            {
                "chunk_id": f"{doc_id}_{idx}",
                "doc_id": doc_id,
                "doc_title": doc_id,
                "doc_type": state.get("doc_type", "luat"),
                "legal_domain": state.get("legal_domain"),
                "article_ref": f"Dieu {idx}",
                "content": section,
                "is_active": True,
            }
        )

    return {**state, "chunks": chunks, "chunks_created": len(chunks)}
