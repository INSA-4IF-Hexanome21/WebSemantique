include ../config.mk

.DEFAULT_GOAL := run

.PHONY: install dev run

install:
	python3 -m venv venv
	./venv/bin/pip install -q --disable-pip-version-check "fastapi[standard]"

dev:
	FRONTEND_IP=$(IP) FRONTEND_PORT=$(FRONTEND_PORT) ./venv/bin/fastapi dev serveur.py --host $(IP) --port $(BACKEND_PORT)

run:
	FRONTEND_IP=$(IP) FRONTEND_PORT=$(FRONTEND_PORT) ./venv/bin/fastapi run serveur.py --host $(IP) --port $(BACKEND_PORT)