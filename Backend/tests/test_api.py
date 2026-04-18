from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

from app.main import app, settings

client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in {"ok", "degraded"}
    assert data["qdrant"] in {"connected", "disconnected"}
    assert "chunks_indexed" in data


def test_query() -> None:
    payload = {
        "question": "Nguoi lao dong co quyen don phuong cham dut hop dong trong truong hop nao?",
        "top_k": 3,
        "legal_domain": "lao_dong",
    }
    response = client.post("/api/v1/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "citations" in data


def test_import() -> None:
    files = {"file": ("law.pdf", b"Dieu 1 Noi dung luat\nDieu 2 Dieu khoan", "application/pdf")}
    data = {"doc_type": "luat", "legal_domain": "dan_su"}
    response = client.post("/api/v1/import", files=files, data=data)
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["chunks_created"] >= 1


def test_simple_chat() -> None:
    with patch("app.services.chat_service.router.generate", new=AsyncMock(return_value="demo answer")):
        response = client.post("/api/v1/chat/simple", json={"prompt": "Hello"})
    assert response.status_code == 200
    body = response.json()
    assert body["answer"] == "demo answer"
    assert isinstance(body["latency_ms"], int)


def test_cloudinary_upload_requires_pdf() -> None:
    files = {"file": ("notes.txt", b"not-a-pdf", "text/plain")}
    response = client.post("/api/v1/cloudinary/upload", files=files)
    assert response.status_code == 400


def test_cloudinary_upload_requires_pdf_mime() -> None:
    files = {"file": ("law.pdf", b"%PDF-1.4\n%%EOF", "application/octet-stream")}
    response = client.post("/api/v1/cloudinary/upload", files=files)
    assert response.status_code == 415


def test_cloudinary_upload_rejects_path_traversal_filename() -> None:
    files = {"file": ("../law.pdf", b"%PDF-1.4\n%%EOF", "application/pdf")}
    response = client.post("/api/v1/cloudinary/upload", files=files)
    assert response.status_code == 400


def test_cloudinary_upload_rejects_invalid_signature() -> None:
    files = {"file": ("law.pdf", b"not-pdf-content", "application/pdf")}
    response = client.post("/api/v1/cloudinary/upload", files=files)
    assert response.status_code == 400


def test_cloudinary_upload_respects_size_limit() -> None:
    old_size = settings.upload_max_file_size_mb
    settings.upload_max_file_size_mb = 1
    try:
        payload = b"%PDF-1.7\n" + (b"x" * (1024 * 1024 + 1)) + b"\n%%EOF"
        files = {"file": ("law.pdf", payload, "application/pdf")}
        response = client.post("/api/v1/cloudinary/upload", files=files)
        assert response.status_code == 413
    finally:
        settings.upload_max_file_size_mb = old_size
