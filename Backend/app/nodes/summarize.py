from __future__ import annotations
from app.graphs.state import GraphState
from app.llm import router

from app.utils.logger import get_logger

logger = get_logger(__name__)

async def run(state: GraphState) -> GraphState:
    raw_text = state.get("raw_text") or ""
    logger.info("summarize_node_received_text", text_length=len(raw_text))
    
    if not raw_text:
        error = state.get("error")
        if error:
            return {**state, "summary": f"Không thể tóm tắt do lỗi trích xuất: {error}"}
        return {**state, "summary": "Không có nội dung văn bản để tóm tắt (có thể đây là file ảnh hoặc PDF scan chưa qua OCR)."}

    # Limit text to avoid exceeding LLM context (especially Groq 12k token limit)
    # 30k characters is roughly 7k-10k tokens, which is safer.
    text_to_summarize = raw_text[:30000]
    
    prompt = f"""Hãy tóm tắt văn bản hành chính/pháp luật sau đây một cách súc tích nhưng đầy đủ các ý chính:
- Tên văn bản (nếu có)
- Cơ quan ban hành
- Mục đích chính
- Các nội dung/quy định quan trọng nhất

VĂN BẢN:
\"\"\"
{text_to_summarize}
\"\"\"
"""
    
    system_prompt = "Bạn là chuyên gia phân tích văn bản hành chính Việt Nam. Hãy tóm tắt văn bản một cách khách quan, chuyên nghiệp bằng tiếng Việt."
    
    try:
        summary = await router.generate(prompt, extra_system_prompt=system_prompt)
        return {**state, "summary": summary}
    except Exception as e:
        return {**state, "summary": f"Lỗi khi tóm tắt: {str(e)}"}
