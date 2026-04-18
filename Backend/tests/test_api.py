from fastapi.testclient import TestClient

from app.main import app

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
