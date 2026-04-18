from __future__ import annotations

from app.graphs.state import GraphState
from app.utils.text_utils import expand_abbreviation, normalize_text


KEYWORD_HINTS = {
    "hop dong lao dong": "cham dut don phuong thoi han",
    "nghi viec": "bao truoc tro cap",
}


async def run(state: GraphState) -> GraphState:
    question = state.get("question") or ""
    rewritten = normalize_text(expand_abbreviation(question))

    lower = rewritten.lower()
    for key, extra in KEYWORD_HINTS.items():
        if key in lower and extra not in lower:
            rewritten = f"{rewritten} {extra}"

    return {**state, "rewritten_query": rewritten}
