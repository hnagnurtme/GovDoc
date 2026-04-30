from __future__ import annotations
import pymupdf4llm
from pathlib import Path
from app.graphs.state import GraphState

async def run(state: GraphState) -> GraphState:
    file_path = state.get("file_path")
    if not file_path:
        return {**state, "error": "file_path is required"}

    path = Path(file_path)
    if not path.exists():
        return {**state, "error": f"File not found: {file_path}"}

    try:
        # Using pymupdf4llm to extract structured markdown from PDF
        raw_text = pymupdf4llm.to_markdown(str(path))
    except Exception as exc:
        return {**state, "error": f"PDF extraction failed: {str(exc)}"}

    return {**state, "raw_text": raw_text}
