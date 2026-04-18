import time

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.chat_service import generate_simple_reply
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["chat"])


class SimpleChatRequest(BaseModel):
    prompt: str = Field(min_length=1)


class SimpleChatResponse(BaseModel):
    answer: str
    latency_ms: int


@router.post("/chat/simple", response_model=SimpleChatResponse)
async def simple_chat(payload: SimpleChatRequest) -> SimpleChatResponse:
    t0 = time.perf_counter()
    try:
        answer = await generate_simple_reply(payload.prompt)
    except Exception as exc:
        logger.error("simple_chat_failed", error=str(exc))
        raise HTTPException(status_code=502, detail=f"Simple chat provider unavailable: {str(exc)}") from exc

    latency_ms = int((time.perf_counter() - t0) * 1000)
    return SimpleChatResponse(answer=answer, latency_ms=latency_ms)
