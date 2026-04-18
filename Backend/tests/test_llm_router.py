import pytest

from app.llm import router


@pytest.mark.asyncio
async def test_grok_fallback_without_keys() -> None:
    response = await router._call_grok_direct("test prompt")
    assert "API key" in response
