.DEFAULT_GOAL := run

.PHONY: install run

install:
	python3 -m venv venv
	./venv/bin/pip install -q --disable-pip-version-check "fastapi[standard]"

dev:
	./venv/bin/fastapi dev serveur.py --host 127.0.0.1 --port 8000

run:
	./venv/bin/fastapi run serveur.py --host 127.0.0.1 --port 8000