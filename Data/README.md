# Data Service: mariadb-ai-rag

Muc tieu cua folder nay la chay MariaDB phuc vu RAG backend (GovDoc), bao gom khoi tao plugin vector cho truy van embedding.

## Cau truc

- `docker-compose.yml`: service `mariadb-ai-rag`
- `init/01-enable-vector.sql`: bat MariaDB Vector plugin (`ha_vector`)

## Chay nhanh

```bash
cd Data
docker compose up -d
```

Kiem tra service:

```bash
docker compose ps
docker compose logs -f mariadb-ai-rag
```

## Thong so mac dinh

- Host: `localhost`
- Port: `3306`
- Database: `viet_law_rag`
- User: `raguser`
- Password: `ragpassword`
- Root password: `rootpassword`

## Kiem tra plugin vector

```bash
docker exec -it mariadb-ai-rag mariadb -uroot -prootpassword -e "SHOW PLUGINS LIKE 'ha_vector';"
```

Neu plugin duoc bat, ban co the init schema backend:

```bash
cd ../Backend
mariadb -h 127.0.0.1 -P 3306 -uraguser -pragpassword viet_law_rag < app/db/schema.sql
```

## Ket noi voi Backend

Cap nhat `.env` trong Backend:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=viet_law_rag
DB_USER=raguser
DB_PASSWORD=ragpassword
```

Sau do chay backend:

```bash
cd ../Backend
/Users/anhnon/my_virtualenvs/govdoc/bin/python -m uvicorn app.main:app --reload --port 8000
```

## Reset du lieu DB

Canh bao: lenh nay xoa toan bo data trong volume.

```bash
cd Data
docker compose down -v
docker compose up -d
```
