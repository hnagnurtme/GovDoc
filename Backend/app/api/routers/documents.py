from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.services.import_service import import_document_to_graph
from app.utils.logger import get_logger
from app.utils.validators import validate_doc_type

logger = get_logger(__name__)
router = APIRouter(tags=["documents"])


class ImportResponse(BaseModel):
    doc_id: str
    chunks_created: int
    status: str


@router.post("/import", response_model=ImportResponse)
async def import_document(
    file: UploadFile = File(...),
    doc_type: str = Form("luat"),
    legal_domain: str | None = Form(default=None),
) -> ImportResponse:
    if not validate_doc_type(doc_type):
        raise HTTPException(status_code=400, detail="Invalid doc_type")

    file_bytes = await file.read()
    result = await import_document_to_graph(
        file_bytes=file_bytes,
        filename=file.filename or "document.pdf",
        doc_type=doc_type,
        legal_domain=legal_domain,
    )

    if result.get("error"):
        logger.warning("import_store_warning", warning=result["error"])

    logger.info("import_completed", doc_id=result.get("doc_id"), chunks=result.get("chunks_created"))
    return ImportResponse(
        doc_id=result.get("doc_id", "unknown"),
        chunks_created=int(result.get("chunks_created", 0)),
        status=result.get("status", "success"),
    )
