from __future__ import annotations

from app.graphs.state import GraphState


async def run(state: GraphState) -> GraphState:
    # Placeholder store node: DB ingestion can be wired in here.
    chunks_created = len(state.get("chunks") or [])
    doc_id = (state.get("file_path") or "unknown").split("/")[-1].split(".")[0]
    return {
        **state,
        "doc_id": doc_id,
        "chunks_created": chunks_created,
        "status": "success",
    }
