from fastapi import APIRouter, File, UploadFile
from pydantic import BaseModel

from app.services.cloudinary_service import (
    scan_and_sanitize_filename,
    upload_pdf,
    validate_upload_payload,
)

router = APIRouter(tags=["cloudinary"])


class CloudinaryUploadResponse(BaseModel):
    secure_url: str
    pages: int | None = None
    original_filename: str | None = None
    public_id: str | None = None
    preview_image_url: str | None = None


@router.post("/cloudinary/upload", response_model=CloudinaryUploadResponse)
async def upload_cloudinary_pdf(file: UploadFile = File(...)) -> CloudinaryUploadResponse:
    safe_filename = scan_and_sanitize_filename(file.filename or "")
    file_bytes = await file.read()
    content_type = file.content_type or ""
    validate_upload_payload(content_type=content_type, file_bytes=file_bytes)

    payload = await upload_pdf(
        file_bytes=file_bytes,
        safe_filename=safe_filename,
        content_type=content_type,
    )

    return CloudinaryUploadResponse(**payload)
