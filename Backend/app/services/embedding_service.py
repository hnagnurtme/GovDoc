from __future__ import annotations
from sentence_transformers import SentenceTransformer
from app.utils.settings import get_settings

settings = get_settings()

from typing import Any, cast, overload

class EmbeddingService:
    _instance = None
    _model: Any = None

    def __new__(cls) -> "EmbeddingService":
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
            cls._model = SentenceTransformer(settings.embed_model)
        return cls._instance

    @overload
    def encode(self, texts: str) -> list[float]: ...

    @overload
    def encode(self, texts: list[str]) -> list[list[float]]: ...

    def encode(self, texts: list[str] | str) -> list[list[float]] | list[float]:
        embeddings = self._model.encode(texts)
        if isinstance(texts, str):
            return cast(list[float], embeddings.tolist())
        return cast(list[list[float]], embeddings.tolist())

embedding_service = EmbeddingService()
