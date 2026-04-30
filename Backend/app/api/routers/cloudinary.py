from fastapi import APIRouter, BackgroundTasks, File, UploadFile
from pydantic import BaseModel

from app.services.cloudinary_service import (
    scan_and_sanitize_filename,
    upload_pdf,
    validate_upload_payload,
)
from app.services.import_service import import_document_to_graph

router = APIRouter(tags=["cloudinary"])

class CloudinaryUploadResponse(BaseModel):
    secure_url: str
    pages: int | None = None
    original_filename: str | None = None
    public_id: str | None = None
    preview_image_url: str | None = None

@router.post("/cloudinary/upload", response_model=CloudinaryUploadResponse)
async def upload_cloudinary_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
) -> CloudinaryUploadResponse:
    safe_filename = scan_and_sanitize_filename(file.filename or "")
    file_bytes = await file.read()
    content_type = file.content_type or ""
    validate_upload_payload(content_type=content_type, file_bytes=file_bytes)

    payload = await upload_pdf(
        file_bytes=file_bytes,
        safe_filename=safe_filename,
        content_type=content_type,
    )

    # Trigger ingestion pipeline in background
    background_tasks.add_task(
        import_document_to_graph,
        file_bytes=file_bytes,
        filename=safe_filename,
        doc_type="luat",
        legal_domain=None
    )

    return CloudinaryUploadResponse(**payload)
