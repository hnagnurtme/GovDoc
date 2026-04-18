.PHONY: serve test lint clean

serve:
	uvicorn app.main:app --reload --port 8000

test:
	pytest tests/ -v

lint:
	ruff check app tests
	mypy app

clean:
	rm -rf .pytest_cache .mypy_cache .ruff_cache
