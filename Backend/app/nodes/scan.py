from __future__ import annotations

from pathlib import Path

from app.graphs.state import GraphState


async def run(state: GraphState) -> GraphState:
    file_path = state.get("file_path")
    if not file_path:
        return {**state, "error": "file_path is required"}

    path = Path(file_path)
    if not path.exists():
        return {**state, "error": f"File not found: {file_path}"}

    # Minimal extraction fallback for local development.
    raw_text = path.read_bytes().decode("utf-8", errors="ignore")
    return {**state, "raw_text": raw_text}
