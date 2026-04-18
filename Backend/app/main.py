from __future__ import annotations

import tempfile
import time
from hashlib import sha1
from pathlib import Path
import re
from urllib.parse import quote

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.db.connection import check_connection
from app.graphs.import_graph import build_import_graph
from app.graphs.query_graph import build_query_graph
from app.llm import router
from app.utils.logger import get_logger
from app.utils.settings import get_settings
from app.utils.validators import validate_doc_type

logger = get_logger(__name__)
app = FastAPI(title="GovDoc Intellisense Backend", version="0.1.0")
API_PREFIX = "/api/v1"
settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

import_graph = build_import_graph()
query_graph = build_query_graph()


class QueryRequest(BaseModel):
    question: str = Field(min_length=3)
    top_k: int = Field(default=5, ge=1, le=20)
    legal_domain: str | None = None
    is_active_only: bool = True


class Citation(BaseModel):
    article_ref: str | None = None
    doc_title: str | None = None
    content: str | None = None
    score: float = 0.0


class QueryResponse(BaseModel):
    answer: str
    citations: list[Citation]
    legal_domain: str | None = None
    latency_ms: int


class ImportResponse(BaseModel):
    doc_id: str
    chunks_created: int
    status: str


class CredentialCheckResult(BaseModel):
    provider: str
    ok: bool
    status_code: int
    detail: str


class CredentialCheckResponse(BaseModel):
    openrouter: CredentialCheckResult | None = None
    groq: CredentialCheckResult | None = None


class CloudinaryUploadResponse(BaseModel):
    secure_url: str
    pages: int | None = None
    original_filename: str | None = None
    public_id: str | None = None
    preview_image_url: str | None = None


ALLOWED_UPLOAD_MIME_TYPES = {"application/pdf"}


def _scan_and_sanitize_filename(filename: str) -> str:
    if not filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    if any(ord(ch) < 32 for ch in filename):
        raise HTTPException(status_code=400, detail="Invalid control chars in filename")

    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid path segments in filename")

    basename = Path(filename).name.strip()
    if not basename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    if not basename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    stem = Path(basename).stem
    safe_stem = re.sub(r"[^A-Za-z0-9._-]+", "_", stem).strip("._-")
    if not safe_stem:
        safe_stem = "document"

    return f"{safe_stem}.pdf"


def _validate_pdf_signature(file_bytes: bytes) -> None:
    if not file_bytes.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="Invalid PDF signature")

    if b"%%EOF" not in file_bytes[-2048:]:
        raise HTTPException(status_code=400, detail="Corrupted PDF content")


def _build_preview_image_url(public_id: str) -> str:
    encoded_public_id = quote(public_id, safe="/")
    return (
        f"https://res.cloudinary.com/{settings.cloudinary_cloud_name}/"
        f"image/upload/pg_1,f_jpg,q_auto,w_900/{encoded_public_id}.jpg"
    )


@app.get(f"{API_PREFIX}/health")
async def health() -> dict:
    qdrant_status, chunks_indexed, db_error = check_connection()
    payload = {
        "status": "ok" if qdrant_status == "connected" else "degraded",
        "qdrant": qdrant_status,
        "llm_router": "openrouter",
        "chunks_indexed": chunks_indexed,
    }
    if db_error:
        payload["db_error"] = db_error
    return payload


@app.get(f"{API_PREFIX}/llm/credentials", response_model=CredentialCheckResponse)
async def llm_credentials(provider: str = "all") -> CredentialCheckResponse:
    provider = provider.lower().strip()
    if provider not in {"all", "openrouter", "groq"}:
        raise HTTPException(status_code=400, detail="provider must be one of: all, openrouter, groq")

    openrouter_result = None
    groq_result = None
    if provider in {"all", "openrouter"}:
        openrouter_result = CredentialCheckResult(**(await router.check_openrouter_credential()))
    if provider in {"all", "groq"}:
        groq_result = CredentialCheckResult(**(await router.check_groq_credential()))

    return CredentialCheckResponse(openrouter=openrouter_result, groq=groq_result)


@app.post(f"{API_PREFIX}/query", response_model=QueryResponse)
async def query(payload: QueryRequest) -> QueryResponse:
    t0 = time.perf_counter()
    result = await query_graph.ainvoke(
        {
            "question": payload.question,
            "top_k": payload.top_k,
            "legal_domain": payload.legal_domain,
            "is_active_only": payload.is_active_only,
        }
    )

    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])

    latency_ms = int((time.perf_counter() - t0) * 1000)
    return QueryResponse(
        answer=result.get("answer", ""),
        citations=[Citation(**c) for c in result.get("citations", [])],
        legal_domain=payload.legal_domain,
        latency_ms=latency_ms,
    )


@app.post(f"{API_PREFIX}/import", response_model=ImportResponse)
async def import_document(
    file: UploadFile = File(...),
    doc_type: str = Form("luat"),
    legal_domain: str | None = Form(default=None),
) -> ImportResponse:
    if not validate_doc_type(doc_type):
        raise HTTPException(status_code=400, detail="Invalid doc_type")

    suffix = Path(file.filename or "document.pdf").suffix or ".pdf"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        result = await import_graph.ainvoke(
            {
                "file_path": tmp_path,
                "doc_type": doc_type,
                "legal_domain": legal_domain,
            }
        )
    finally:
        Path(tmp_path).unlink(missing_ok=True)

    if result.get("error"):
        logger.warning("import_store_warning", warning=result["error"])

    logger.info("import_completed", doc_id=result.get("doc_id"), chunks=result.get("chunks_created"))
    return ImportResponse(
        doc_id=result.get("doc_id", "unknown"),
        chunks_created=int(result.get("chunks_created", 0)),
        status=result.get("status", "success"),
    )


@app.post(f"{API_PREFIX}/cloudinary/upload", response_model=CloudinaryUploadResponse)
async def upload_cloudinary_pdf(file: UploadFile = File(...)) -> CloudinaryUploadResponse:
    safe_filename = _scan_and_sanitize_filename(file.filename or "")

    content_type = (file.content_type or "").lower().strip()
    if content_type not in ALLOWED_UPLOAD_MIME_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported MIME type")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file")

    max_bytes = max(settings.upload_max_file_size_mb, 1) * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(status_code=413, detail="File exceeds max allowed size")

    _validate_pdf_signature(file_bytes)

    if not settings.cloudinary_cloud_name or not settings.cloudinary_api_key or not settings.cloudinary_api_secret:
        raise HTTPException(
            status_code=503,
            detail="Cloudinary is not configured on backend",
        )

    timestamp = int(time.time())
    signature_payload = f"timestamp={timestamp}{settings.cloudinary_api_secret}"
    signature = sha1(signature_payload.encode("utf-8")).hexdigest()

    form_data = {
        "api_key": settings.cloudinary_api_key,
        "timestamp": str(timestamp),
        "signature": signature,
    }
    files = {
        "file": (safe_filename, file_bytes, content_type),
    }

    upload_url = f"https://api.cloudinary.com/v1_1/{settings.cloudinary_cloud_name}/auto/upload"
    async with httpx.AsyncClient(timeout=45.0) as client:
        response = await client.post(upload_url, data=form_data, files=files)

    if response.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail=f"Cloudinary upload failed: {response.text[:300]}",
        )

    payload = response.json()
    secure_url = payload.get("secure_url")
    public_id = payload.get("public_id")
    if not secure_url or not public_id:
        raise HTTPException(status_code=502, detail="Cloudinary response missing required fields")

    return CloudinaryUploadResponse(
        secure_url=secure_url,
        pages=payload.get("pages"),
        original_filename=payload.get("original_filename"),
        public_id=public_id,
        preview_image_url=_build_preview_image_url(public_id),
    )
