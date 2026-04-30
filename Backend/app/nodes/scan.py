from __future__ import annotations
import pypdf
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
        # Using pypdf to extract plain text from PDF
        reader = pypdf.PdfReader(str(path))
        text_parts = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text.strip())
        raw_text = "\n\n".join(text_parts)
    except Exception as exc:
        return {**state, "error": f"PDF extraction failed: {str(exc)}"}

    return {**state, "raw_text": raw_text}
