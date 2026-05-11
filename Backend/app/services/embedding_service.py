import httpx
from typing import cast, overload
from app.utils.settings import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


class EmbeddingService:
    _instance = None

    def __new__(cls) -> "EmbeddingService":
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
        return cls._instance

    @overload
    def encode(self, texts: str, task: str | None = None) -> list[float]: ...

    @overload
    def encode(self, texts: list[str], task: str | None = None) -> list[list[float]]: ...

    def encode(self, texts: list[str] | str, task: str | None = None) -> list[list[float]] | list[float]:
        if not texts:
            return [] if isinstance(texts, list) else [0.0] * settings.embed_dim

        input_texts = [texts] if isinstance(texts, str) else texts
        
        # Determine default task if not provided
        if task is None:
            task = "retrieval.query" if isinstance(texts, str) else "retrieval.passage"
        
        try:
            with httpx.Client() as client:
                response = client.post(
                    "https://api.jina.ai/v1/embeddings",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {settings.jina_api_key}",
                    },
                    json={
                        "model": settings.embed_model,
                        "task": task,
                        "dimensions": settings.embed_dim,
                        "late_chunking": False,
                        "embedding_type": "float",
                        "input": input_texts,
                    },
                    timeout=60.0,
                )
                response.raise_for_status()
                data = response.json()
                embeddings = [item["embedding"] for item in data["data"]]
                
                if isinstance(texts, str):
                    return cast(list[float], embeddings[0])
                return cast(list[list[float]], embeddings)
        except Exception as e:
            logger.error("jina_embedding_failed", error=str(e))
            raise

embedding_service = EmbeddingService()
