from contextlib import asynccontextmanager

try:
    import mariadb
except ModuleNotFoundError:  # pragma: no cover - depends on local native deps
    mariadb = None

from app.utils.settings import get_settings

settings = get_settings()


def _resolved_db_host() -> str:
    # MariaDB Python client may prefer UNIX socket when host=localhost.
    # Force TCP for Docker-based local development.
    return "127.0.0.1" if settings.db_host == "localhost" else settings.db_host

pool = None


def _get_pool():
    global pool
    if mariadb is None:
        return None
    if pool is None:
        pool = mariadb.ConnectionPool(
            host=_resolved_db_host(),
            port=settings.db_port,
            user=settings.db_user,
            password=settings.db_password,
            database=settings.db_name,
            pool_size=10,
            pool_name="rag_pool",
        )
    return pool


def check_connection() -> tuple[str, int, str | None]:
    if mariadb is None:
        return "disconnected", 0, "mariadb driver is not installed"

    try:
        db_pool = _get_pool()
        if db_pool is None:
            return "disconnected", 0, "connection pool is unavailable"

        conn = db_pool.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            chunks_indexed = 0
            try:
                cursor.execute("SELECT COUNT(*) FROM law_chunks")
                row = cursor.fetchone()
                chunks_indexed = int(row[0]) if row else 0
            except Exception:
                # DB is reachable even when schema is not initialized yet.
                chunks_indexed = 0
            return "connected", chunks_indexed, None
        finally:
            conn.close()
    except Exception as exc:
        return "disconnected", 0, str(exc)


@asynccontextmanager
async def get_conn():
    db_pool = _get_pool()
    if db_pool is None:
        raise RuntimeError("MariaDB pool is unavailable")

    conn = db_pool.get_connection()
    try:
        yield conn
    finally:
        conn.close()
