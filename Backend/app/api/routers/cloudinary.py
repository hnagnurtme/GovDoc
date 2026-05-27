import time
from fastapi import APIRouter, Depends, File, Form, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import models
from app.db.session import get_db
from app.services import auth_service
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
    summary: str | None = None


@router.post("/cloudinary/upload", response_model=CloudinaryUploadResponse)
async def upload_cloudinary_pdf(
    file: UploadFile = File(...),
    chat_id: str | None = Form(default=None, alias="chatId"),
    current_user: models.User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
) -> CloudinaryUploadResponse:
    safe_filename = scan_and_sanitize_filename(file.filename or "")
    file_bytes = await file.read()
    content_type = file.content_type or ""
    validate_upload_payload(content_type=content_type, file_bytes=file_bytes)

    # Upload PDF and generate preview image using Cloudinary service
    payload = await upload_pdf(
        file_bytes=file_bytes,
        safe_filename=safe_filename,
        content_type=content_type,
    )

    # Run ingestion pipeline and wait for chunking and summary result
    import_result = await import_document_to_graph(
        file_bytes=file_bytes,
        filename=safe_filename,
        doc_type="luat",
        legal_domain=None
    )

    summary_text = import_result.get("summary")

    # Save document details to the relational database
    doc_id = f"doc-{int(time.time())}"
    db_doc = models.Document(
        id=doc_id,
        filename=safe_filename,
        pages=payload.get("pages"),
        file_url=payload.get("secure_url"),
        preview_image_url=payload.get("preview_image_url"),
        summary=summary_text,
        chat_id=chat_id,
        user_id=current_user.id
    )
    db.add(db_doc)
    db.commit()

    return CloudinaryUploadResponse(
        secure_url=payload.get("secure_url", ""),
        pages=payload.get("pages"),
        original_filename=payload.get("original_filename"),
        public_id=payload.get("public_id"),
        preview_image_url=payload.get("preview_image_url"),
        summary=summary_text
    )
