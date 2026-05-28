import asyncio
import platform
from typing import cast, overload
import httpx
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

    def _get_device(self) -> str:
        if settings.embed_device:
            return settings.embed_device

        # Auto-detect best device
        try:
            import torch
            if platform.system() == "Darwin":
                # Force CPU on macOS to avoid PyTorch MPS bug
                return "cpu"
            if torch.cuda.is_available():
                return "cuda"
        except ImportError:
            pass
        return "cpu"

    def _get_model(self) -> SentenceTransformer:
        if self._model is None:
            device = self._get_device()
            logger.info("loading_local_embedding_model", model=settings.embed_model, device=device)
            self._model = SentenceTransformer(settings.embed_model, device=device)
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

        # 1. Use Jina embeddings API if JINA_API_KEY is configured and model starts with 'jina-'
        if settings.jina_api_key and settings.embed_model.startswith("jina-"):
            result_embeddings = await self._encode_jina(input_texts, task)
        else:
            # 2. Fallback to local SentenceTransformer model
            model = self._get_model()
            # Run local CPU/GPU intensive inference in a background thread to prevent event loop blocking
            embeddings = await asyncio.to_thread(
                model.encode,
                input_texts,
                show_progress_bar=False,
                convert_to_numpy=True
            )
            result_embeddings = embeddings.tolist()

        if isinstance(texts, str):
            return cast(list[float], result_embeddings[0])
        return cast(list[list[float]], result_embeddings)

    async def _encode_jina(self, texts: list[str], task: str | None) -> list[list[float]]:
        # Jina Embeddings API limits batch size or total payload size.
        # We chunk inputs to be safe (e.g., max 100 items per request).
        chunk_size = 100
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.jina_api_key}"
        }
        url = "https://api.jina.ai/v1/embeddings"
        
        result_embeddings: list[list[float]] = [[]] * len(texts)
        
        # We process chunks sequentially or concurrently. Let's do sequentially to avoid hitting rate limits.
        for i in range(0, len(texts), chunk_size):
            batch = texts[i:i + chunk_size]
            payload = {
                "model": settings.embed_model,
                "task": task or "retrieval.passage",
                "dimensions": settings.embed_dim,
                "late_chunking": False,
                "embedding_type": "float",
                "input": batch
            }
            logger.info("requesting_jina_embeddings", model=settings.embed_model, batch_size=len(batch))
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                if response.status_code != 200:
                    logger.error("jina_embedding_failed", status_code=response.status_code, body=response.text)
                    response.raise_for_status()
                
                data = response.json()
                records = data.get("data", [])
                for record in records:
                    idx = i + record["index"]
                    result_embeddings[idx] = record["embedding"]
                    
        return result_embeddings


embedding_service = EmbeddingService()
