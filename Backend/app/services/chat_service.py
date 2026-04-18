from app.llm import router


async def generate_simple_reply(prompt: str) -> str:
    return await router.generate(prompt.strip())
