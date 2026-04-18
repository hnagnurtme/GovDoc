from contextlib import asynccontextmanager

import mariadb

from app.utils.settings import get_settings

settings = get_settings()

pool = mariadb.ConnectionPool(
    host=settings.db_host,
    port=settings.db_port,
    user=settings.db_user,
    password=settings.db_password,
    database=settings.db_name,
    pool_size=10,
    pool_name="rag_pool",
)


@asynccontextmanager
async def get_conn():
    conn = pool.get_connection()
    try:
        yield conn
    finally:
        conn.close()
