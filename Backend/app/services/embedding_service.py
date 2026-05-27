import asyncio
from typing import cast, overload
from sentence_transformers import SentenceTransformer
from app.utils.settings import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


class EmbeddingService:
    _instance = None
    _model = None

    def __new__(cls) -> "EmbeddingService":
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
        return cls._instance

    def _get_model(self) -> SentenceTransformer:
        if self._model is None:
            logger.info("loading_local_embedding_model", model=settings.embed_model)
            # Force device to 'cpu' to avoid PyTorch MPS 'Invalid buffer size: 28.00 GiB' memory allocation bug on macOS
            self._model = SentenceTransformer(settings.embed_model, device="cpu")
            logger.info("local_embedding_model_loaded")
        return self._model

    @overload
    async def encode(self, texts: str, task: str | None = None) -> list[float]: ...

    @overload
    async def encode(self, texts: list[str], task: str | None = None) -> list[list[float]]: ...

    async def encode(
        self, texts: list[str] | str, task: str | None = None
    ) -> list[list[float]] | list[float]:
        if not texts:
            return [] if isinstance(texts, list) else [0.0] * settings.embed_dim

        input_texts = [texts] if isinstance(texts, str) else texts

        # Load local model
        model = self._get_model()
        
        # Run local CPU/GPU intensive inference in a background thread to prevent event loop blocking
        embeddings = await asyncio.to_thread(
            model.encode,
            input_texts,
            show_progress_bar=False,
            convert_to_numpy=True
        )
        
        # Convert numpy embeddings array back to standard lists
        result_embeddings = embeddings.tolist()

        if isinstance(texts, str):
            return cast(list[float], result_embeddings[0])
        return cast(list[list[float]], result_embeddings)


embedding_service = EmbeddingService()
