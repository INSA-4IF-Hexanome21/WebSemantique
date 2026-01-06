include ../config.mk

.PHONY: kill install dev run

.DEFAULT_GOAL := run
ENV_VARS := FRONTEND_IP=$(IP) FRONTEND_PORT=$(FRONTEND_PORT)

kill:
	lsof -ti :$(BACKEND_PORT) | xargs kill -9 2>/dev/null || true

install:
	python3 -m venv venv
	./venv/bin/pip install -q --disable-pip-version-check -r requirements.txt

dev:
	$(ENV_VARS) ./venv/bin/fastapi dev serveur.py --host $(IP) --port $(BACKEND_PORT)

run:
	$(ENV_VARS) ./venv/bin/fastapi run serveur.py --host $(IP) --port $(BACKEND_PORT)