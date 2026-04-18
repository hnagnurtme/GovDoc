from __future__ import annotations

from app.graphs.state import GraphState
from app.llm import prompts, router


def _build_context(chunks: list[dict]) -> str:
    parts = []
    for chunk in chunks:
        parts.append(f"[{chunk.get('article_ref', 'N/A')}] {chunk.get('content', '')}")
    return "\n".join(parts)


def _extract_citations(chunks: list[dict]) -> list[dict]:
    citations = []
    for chunk in chunks:
        citations.append(
            {
                "article_ref": chunk.get("article_ref"),
                "doc_title": chunk.get("doc_title"),
                "content": chunk.get("content"),
                "score": chunk.get("score", 0.0),
            }
        )
    return citations


async def run(state: GraphState) -> GraphState:
    question = state.get("question") or ""
    reranked = state.get("reranked_chunks") or []

    if not reranked:
        return {
            **state,
            "answer": "Khong tim thay dieu khoan phu hop voi cau hoi.",
            "citations": [],
        }

    context = _build_context(reranked)
    prompt = prompts.qa_prompt(question, context)

    try:
        answer = await router.generate(prompt)
    except Exception:
        answer = (
            "Theo cac dieu khoan truy xuat duoc, thong tin lien quan da duoc tong hop o phan trich dan. "
            "Ban co the doi chieu truc tiep dieu luat de xac nhan noi dung chi tiet."
        )

    return {**state, "answer": answer, "citations": _extract_citations(reranked)}
