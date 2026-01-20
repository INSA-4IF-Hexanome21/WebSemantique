.DEFAULT_GOAL := run
.PHONY: kill install dev run

# CONFIGURATION
# =============

IP := 127.0.0.1
PORT := 8000
VENV_BIN := venv/bin
PYTHON := python3

# TARGETS
# =======

kill:
	-lsof -ti :$(PORT) | xargs kill -9 2>/dev/null || true

install:
	$(PYTHON) -m venv venv
	./$(VENV_BIN)/pip install -q --disable-pip-version-check -r requirements.txt

dev: install
	$(ENV_VARS) ./$(VENV_BIN)/fastapi dev ./backend/serveur.py --host $(IP) --port $(PORT)

run: install
	$(ENV_VARS) ./$(VENV_BIN)/fastapi run ./backend/serveur.py --host $(IP) --port $(PORT)