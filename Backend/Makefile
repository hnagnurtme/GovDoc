.PHONY: serve test lint db-init clean

serve:
	uvicorn app.main:app --reload --port 8000

test:
	pytest tests/ -v

lint:
	ruff check app tests
	mypy app

db-init:
	mariadb -h $${DB_HOST:-localhost} -P $${DB_PORT:-3306} -u $${DB_USER} -p$${DB_PASSWORD} $${DB_NAME} < app/db/schema.sql

clean:
	rm -rf .pytest_cache .mypy_cache .ruff_cache
